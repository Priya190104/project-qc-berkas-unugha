/**
 * DELETE /api/berkas/[id] - Delete berkas
 * Hanya ADMIN yang bisa delete
 * 
 * POST /api/berkas/[id]/move-stage - Move berkas ke stage berikutnya
 * ADMIN, DATA_BERKAS, DATA_UKUR, DATA_PEMETAAN bisa
 * QUALITY_CONTROL hanya approve/reject
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { canPerformAction } from '@/lib/auth/roles'
import { UserRole } from '@/lib/auth/roles'

const STAGE_PROGRESSION: Record<string, string> = {
  DATA_BERKAS: 'DATA_UKUR',
  DATA_UKUR: 'PEMETAAN',
  PEMETAAN: 'KKS',
  KKS: 'KASI',
  KASI: 'SELESAI',
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: berkasId } = await params

    // Validasi user
    const user = await extractUserFromRequest(request)
    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Hanya ADMIN yang bisa delete
    if (!canPerformAction(user.role, 'delete')) {
      return NextResponse.json(
        {
          error: `Forbidden: Your role "${user.role}" cannot delete berkas. Only ADMIN can delete.`,
        },
        { status: 403 }
      )
    }

    // Get berkas dari database
    const existingBerkas = await prisma.berkas.findUnique({
      where: { id: berkasId },
    })

    if (!existingBerkas) {
      return NextResponse.json(
        { error: 'Berkas tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete berkas
    await prisma.berkas.delete({
      where: { id: berkasId },
    })

    // Log activity
    await prisma.riwayatBerkas.create({
      data: {
        berkasId: berkasId,
        statusLama: existingBerkas.statusBerkas,
        statusBaru: 'DELETED',
        diterima: user.name,
        catatan: `Berkas dihapus oleh ADMIN: ${user.name}`,
      },
    })

    // Revalidate berkas pages
    revalidatePath('/berkas')

    return NextResponse.json({
      success: true,
      message: 'Berkas berhasil dihapus',
      deleted_id: berkasId,
    })
  } catch (error: any) {
    console.error('Error deleting berkas:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/berkas/[id]/move-stage
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: berkasId } = await params
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'move'

    // Validasi user
    const user = await extractUserFromRequest(request)
    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Validasi permission move_stage
    if (!canPerformAction(user.role, 'move_stage')) {
      return NextResponse.json(
        {
          error: `Forbidden: Your role "${user.role}" cannot move berkas to next stage`,
        },
        { status: 403 }
      )
    }

    // Get berkas dari database
    const existingBerkas = await prisma.berkas.findUnique({
      where: { id: berkasId },
    })

    if (!existingBerkas) {
      return NextResponse.json(
        { error: 'Berkas tidak ditemukan' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const currentStatus = existingBerkas.statusBerkas
    const nextStatus = STAGE_PROGRESSION[currentStatus]

    // Validasi jika sudah di stage terakhir
    if (!nextStatus) {
      return NextResponse.json(
        {
          error: `Berkas sudah di stage terakhir (${currentStatus})`,
        },
        { status: 400 }
      )
    }

    // Update status
    const updatedBerkas = await prisma.berkas.update({
      where: { id: berkasId },
      data: {
        statusBerkas: nextStatus,
      },
    })

    // Log activity
    await prisma.riwayatBerkas.create({
      data: {
        berkasId: berkasId,
        statusLama: currentStatus,
        statusBaru: nextStatus,
        diterima: user.name,
        diteruskan: body.diteruskan || null,
        catatan: body.catatan || `Berkas dimulai oleh ${user.role}: ${user.name}`,
      },
    })

    // Revalidate berkas pages
    revalidatePath('/berkas')
    revalidatePath(`/berkas/${berkasId}`)
    revalidatePath('/dashboard')

    return NextResponse.json({
      success: true,
      data: updatedBerkas,
      message: `Berkas berhasil dipindahkan dari ${currentStatus} ke ${nextStatus}`,
      stage_progression: {
        from: currentStatus,
        to: nextStatus,
      },
    })
  } catch (error: any) {
    console.error('Error moving berkas stage:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
