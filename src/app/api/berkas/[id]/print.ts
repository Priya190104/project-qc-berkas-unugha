/**
 * GET /api/berkas/[id]/print - Print berkas
 * Semua role dengan canPrint=true bisa akses
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { canPerformAction } from '@/lib/auth/roles'

export async function GET(
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

    // Validasi permission print
    if (!canPerformAction(user.role, 'print')) {
      return NextResponse.json(
        {
          error: `Forbidden: Your role "${user.role}" cannot print berkas`,
        },
        { status: 403 }
      )
    }

    // Get berkas dari database
    const berkasData = await prisma.berkas.findUnique({
      where: { id: berkasId },
    })

    if (!berkasData) {
      return NextResponse.json(
        { error: 'Berkas tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get riwayat berkas untuk print detail
    const riwayat = await prisma.riwayatBerkas.findMany({
      where: { berkasId: berkasId },
      orderBy: { createdAt: 'asc' },
    })

    // Return data dengan format yang bisa diprint
    return NextResponse.json({
      success: true,
      data: {
        ...berkasData,
        riwayat: riwayat,
      },
      printable: true,
      timestamp: new Date().toISOString(),
      printed_by: {
        user: user.name,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('Error printing berkas:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
