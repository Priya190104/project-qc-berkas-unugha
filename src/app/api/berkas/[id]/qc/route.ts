/**
 * POST /api/berkas/[id]/qc
 * Submit Quality Control decision (ACC atau REVISI)
 * Only ADMIN and QUALITY_CONTROL role can submit
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { canPerformAction, UserRole } from '@/lib/auth/roles'

const STAGE_PROGRESSION: Record<string, string> = {
  DATA_BERKAS: 'DATA_UKUR',
  DATA_UKUR: 'PEMETAAN',
  PEMETAAN: 'KKS',
  KKS: 'KASI',
  KASI: 'SELESAI',
}

const STAGE_REVERT: Record<string, string> = {
  KKS: 'PEMETAAN',
  KASI: 'KKS',
}

export async function POST(
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

    // Only ADMIN and QUALITY_CONTROL can submit QC
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.QUALITY_CONTROL) {
      return NextResponse.json(
        {
          error: `Forbidden: Your role "${user.role}" cannot submit Quality Control. Only ADMIN and QUALITY_CONTROL can.`,
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

    // Parse request body
    const body = await request.json()
    const { qcType, qcStatus, keterangan } = body

    // Validasi input
    if (!qcType || !['KKS', 'KASI'].includes(qcType)) {
      return NextResponse.json(
        { error: 'QC Type harus KKS atau KASI' },
        { status: 400 }
      )
    }

    if (!qcStatus || !['ACC', 'REVISI'].includes(qcStatus)) {
      return NextResponse.json(
        { error: 'QC Status harus ACC atau REVISI' },
        { status: 400 }
      )
    }

    // Validasi bahwa berkas berada di stage yang benar
    const currentStatus = existingBerkas.statusBerkas
    
    // Untuk QC KKS: Berkas harus di stage KKS atau sudah pernah direvisi (tetap di KKS)
    if (qcType === 'KKS' && currentStatus !== 'KKS') {
      return NextResponse.json(
        {
          error: `Berkas harus berada di stage KKS untuk melakukan QC KKS. Status saat ini: ${currentStatus}`,
        },
        { status: 400 }
      )
    }

    // Untuk QC KASI: Berkas harus di stage KASI atau sudah pernah direvisi (tetap di KASI)
    if (qcType === 'KASI' && currentStatus !== 'KASI') {
      return NextResponse.json(
        {
          error: `Berkas harus berada di stage KASI untuk melakukan QC KASI. Status saat ini: ${currentStatus}`,
        },
        { status: 400 }
      )
    }

    // Tentukan status berkas baru berdasarkan keputusan QC
    let newStatus = currentStatus
    if (qcStatus === 'ACC') {
      // Jika ACC, lanjutkan ke stage berikutnya
      newStatus = STAGE_PROGRESSION[currentStatus] || currentStatus
    } else if (qcStatus === 'REVISI') {
      // Jika REVISI, status TETAP di stage saat ini untuk memungkinkan revisi berulang
      // Tidak menggunakan STAGE_REVERT karena kita ingin QC bisa dilakukan lagi di stage yang sama
      newStatus = currentStatus
    }

    // Update berkas dengan hasil QC
    const updateData: any = {
      statusBerkas: newStatus,
    }

    if (qcType === 'KKS') {
      updateData.qcKksStatus = qcStatus
      updateData.qcKksKeterangan = keterangan || null
      updateData.qcKksOleh = user.name
      updateData.qcKksTanggal = new Date()
    } else if (qcType === 'KASI') {
      updateData.qcKasiStatus = qcStatus
      updateData.qcKasiKeterangan = keterangan || null
      updateData.qcKasiOleh = user.name
      updateData.qcKasiTanggal = new Date()
    }

    const updatedBerkas = await prisma.berkas.update({
      where: { id: berkasId },
      data: updateData,
    })

    // Log activity to RiwayatBerkas
    const catatan =
      qcStatus === 'ACC'
        ? `QC ${qcType} ACC oleh ${user.name}${keterangan ? ': ' + keterangan : ''}`
        : `QC ${qcType} REVISI oleh ${user.name}${keterangan ? ': ' + keterangan : ''}`

    await prisma.riwayatBerkas.create({
      data: {
        berkasId: berkasId,
        statusLama: existingBerkas.statusBerkas,
        statusBaru: newStatus,
        diterima: user.name,
        catatan: catatan,
      },
    })

    // Revalidate berkas pages
    revalidatePath('/berkas')
    revalidatePath(`/berkas/${berkasId}`)
    revalidatePath('/dashboard')

    return NextResponse.json({
      success: true,
      data: updatedBerkas,
      message: `QC ${qcType} ${qcStatus} berhasil disubmit. Status berkas berubah dari ${existingBerkas.statusBerkas} ke ${newStatus}`,
      qcType: qcType,
      qcStatus: qcStatus,
      newStatus: newStatus,
    })
  } catch (error: any) {
    console.error('Error submitting QC:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
