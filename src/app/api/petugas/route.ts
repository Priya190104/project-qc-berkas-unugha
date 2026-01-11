/**
 * GET /api/petugas - Get daftar petugas
 * POST /api/petugas - Create petugas baru
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    // Validasi user
    const user = await extractUserFromRequest(request)
    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Get tipe dari query parameter (optional)
    const searchParams = request.nextUrl.searchParams
    const tipe = searchParams.get('tipe')

    let petugas
    if (tipe) {
      petugas = await prisma.petugas.findMany({
        where: { tipe },
        orderBy: { createdAt: 'asc' },
      })
    } else {
      petugas = await prisma.petugas.findMany({
        orderBy: { createdAt: 'asc' },
      })
    }

    return NextResponse.json({
      success: true,
      data: petugas,
      count: petugas.length,
    })
  } catch (error) {
    console.error('Error fetching petugas:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validasi user
    const user = await extractUserFromRequest(request)
    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validasi required fields
    if (!body.nama || !body.tipe) {
      return NextResponse.json(
        { error: 'Missing required fields: nama, tipe' },
        { status: 400 }
      )
    }

    // Validasi NIP required untuk Koordinator Ukur
    if (body.tipe === 'KOORDINATOR_UKUR' && !body.nip) {
      return NextResponse.json(
        { error: 'NIP harus diisi untuk Koordinator Ukur' },
        { status: 400 }
      )
    }

    // Check if petugas with same nama already exists
    const existingPetugas = await prisma.petugas.findUnique({
      where: { nama: body.nama },
    })

    if (existingPetugas) {
      return NextResponse.json(
        { error: 'Petugas dengan nama ini sudah terdaftar', code: 'DUPLICATE_NAME' },
        { status: 409 }
      )
    }

    // Create petugas
    const petugas = await prisma.petugas.create({
      data: {
        nama: body.nama,
        nip: body.nip || null,
        tipe: body.tipe,
      },
    })

    // Revalidate pages that show petugas
    revalidatePath('/berkas')
    revalidatePath('/berkas/create')
    revalidatePath('/dashboard')

    return NextResponse.json(
      {
        success: true,
        data: petugas,
        message: 'Petugas berhasil ditambahkan',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating petugas:', error)

    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Petugas dengan nama ini sudah terdaftar', code: 'DUPLICATE_NAME' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
