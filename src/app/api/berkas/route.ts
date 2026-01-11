/**
 * GET /api/berkas - List semua berkas
 * Semua role bisa akses (dengan canView=true)
 * 
 * POST /api/berkas - Create berkas baru
 * Hanya ADMIN dan DATA_BERKAS yang bisa
 * DATA_BERKAS hanya boleh submit DATA_BERKAS section fields
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { canPerformAction, UserRole, BerkasSection } from '@/lib/auth/roles'

// Field mapping untuk menentukan section mana field-field tersebut
const SECTION_FIELDS: Record<BerkasSection, string[]> = {
  DATA_BERKAS: [
    'noBerkas',
    'di302',
    'tanggal302',
    'namaPemohon',
    'jenisPermohonan',
    'statusTanah',
    'keadaanTanah',
    'kecamatan',
    'desa',
    'luas',
    'luas302',
    'luasSU',
    'no305',
    'nib',
    'notaris',
    'biayaUkur',
    'tanggalBerkas',
    'keterangan',
  ],
  DATA_UKUR: [
    'koordinatorUkur',
    'nip',
    'suratTugasAn',
    'petugasUkur',
    'noGu',
    'noStpPersiapuanUkur',
    'tanggalStpPersiapuan',
    'noStp',
    'tanggalStp',
    'posisiBerkasUkur',
  ],
  DATA_PEMETAAN: [
    'petugasPemetaan',
    'posisiBerkasMetaan',
    'keteranganPemetaan',
  ],
}

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

    // Validasi permission
    if (!canPerformAction(user.role, 'view')) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view berkas' },
        { status: 403 }
      )
    }

    // Get semua berkas
    const berkasData = await prisma.berkas.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit untuk prevent data dump
    })

    return NextResponse.json({
      success: true,
      data: berkasData,
      count: berkasData.length,
      user: {
        id: user.userId,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error fetching berkas:', error)
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

    // Validasi permission
    if (!canPerformAction(user.role, 'create')) {
      return NextResponse.json(
        {
          error: `Forbidden: Your role "${user.role}" cannot create berkas`,
          allowed_roles: ['ADMIN', 'DATA_BERKAS'],
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    console.log('POST /api/berkas - Request body:', JSON.stringify(body, null, 2))

    // Validasi required fields
    const requiredFields = ['noBerkas', 'namaPemohon', 'jenisPermohonan']
    const missingFields = requiredFields.filter((field) => !body[field])
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields)
    }

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: 'Missing required fields', missing: missingFields },
        { status: 400 }
      )
    }

    // RBAC: Validasi section fields untuk non-ADMIN users
    // DATA_BERKAS hanya boleh submit DATA_BERKAS section fields
    if (user.role === UserRole.DATA_BERKAS) {
      const allowedFields = new Set(SECTION_FIELDS.DATA_BERKAS)
      const submittedFieldKeys = Object.keys(body)
      
      // Check if user submitted fields dari section lain
      const unauthorizedFields = submittedFieldKeys.filter(
        (field) => !allowedFields.has(field)
      )
      
      if (unauthorizedFields.length > 0) {
        console.log('Unauthorized fields submitted:', unauthorizedFields)
        return NextResponse.json(
          {
            error: 'Forbidden: Your role can only submit DATA_BERKAS section fields',
            unauthorized_fields: unauthorizedFields,
            allowed_sections: ['DATA_BERKAS'],
          },
          { status: 403 }
        )
      }
    }

    // Create berkas
    console.log('Creating berkas with data...')
    const berkas = await prisma.berkas.create({
      data: {
        noBerkas: body.noBerkas,
        di302: body.di302 || null,
        tanggal302: body.tanggal302 ? new Date(body.tanggal302) : null,
        namaPemohon: body.namaPemohon,
        jenisPermohonan: body.jenisPermohonan,
        statusTanah: body.statusTanah || null,
        keadaanTanah: body.keadaanTanah || null,
        kecamatan: body.kecamatan || null,
        desa: body.desa || null,
        luas: body.luas || null,
        luas302: body.luas302 || null,
        luasSU: body.luasSU || null,
        no305: body.no305 || null,
        nib: body.nib || null,
        notaris: body.notaris || null,
        biayaUkur: body.biayaUkur ? parseFloat(body.biayaUkur) : null,
        statusBerkas: 'DATA_BERKAS',
        tanggalBerkas: body.tanggalBerkas ? new Date(body.tanggalBerkas) : new Date(),
        keterangan: body.keterangan || null,
        // Data ukur fields
        koordinatorUkur: body.koordinatorUkur || null,
        nip: body.nip || null,
        suratTugasAn: body.suratTugasAn || null,
        petugasUkur: body.petugasUkur || null,
        noGu: body.noGu || null,
        noStpPersiapuanUkur: body.noStpPersiapuanUkur || null,
        tanggalStpPersiapuan: body.tanggalStpPersiapuan ? new Date(body.tanggalStpPersiapuan) : null,
        noStp: body.noStp || null,
        tanggalStp: body.tanggalStp ? new Date(body.tanggalStp) : null,
        posisiBerkasUkur: body.posisiBerkasUkur || null,
        // Data pemetaan fields
        petugasPemetaan: body.petugasPemetaan || null,
        posisiBerkasMetaan: body.posisiBerkasMetaan || null,
        keteranganPemetaan: body.keteranganPemetaan || null,
      },
    })

    console.log('Berkas created successfully:', berkas.id)

    // Log activity
    if (body.riwayat !== false) {
      await prisma.riwayatBerkas.create({
        data: {
          berkasId: berkas.id,
          statusLama: 'NEW',
          statusBaru: 'DATA_BERKAS',
          diterima: user.name,
          catatan: `Berkas dibuat oleh ${user.role}: ${user.name}`,
        },
      })
      console.log('Riwayat created for berkas:', berkas.id)
    }

    // Revalidate berkas list page to show new data
    revalidatePath('/berkas')

    return NextResponse.json(
      {
        success: true,
        data: berkas,
        message: 'Berkas berhasil dibuat',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating berkas - Full error:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error meta:', error.meta)

    // Handle unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Nomor berkas sudah terdaftar', field: error.meta?.target },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message || String(error) },
      { status: 500 }
    )
  }
}
