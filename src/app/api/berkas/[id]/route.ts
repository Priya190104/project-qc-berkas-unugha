/**
 * PUT /api/berkas/[id] - Update berkas
 * Access kontrol berdasarkan section yang diedit
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { withRetry } from '@/lib/db-retry'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { canPerformAction, canEditSection, BerkasSection } from '@/lib/auth/roles'

// Field mapping untuk menentukan section mana yang diedit
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

/**
 * Helper: Check if a section is complete
 */
function isSectionComplete(berkas: any, section: BerkasSection): boolean {
  switch (section) {
    case 'DATA_BERKAS':
      // Required fields: noBerkas, namaPemohon, jenisPermohonan, statusTanah
      return !!(
        berkas.noBerkas &&
        berkas.namaPemohon &&
        berkas.jenisPermohonan &&
        berkas.statusTanah
      )
    case 'DATA_UKUR':
      // Required fields: koordinatorUkur, petugasUkur
      return !!(berkas.koordinatorUkur && berkas.petugasUkur)
    case 'DATA_PEMETAAN':
      // Required fields: petugasPemetaan
      return !!berkas.petugasPemetaan
    default:
      return false
  }
}

/**
 * Helper: Determine next status based on completed sections
 */
function determineNextStatus(berkas: any): string {
  if (!isSectionComplete(berkas, 'DATA_BERKAS')) {
    return 'DATA_BERKAS'
  }
  if (!isSectionComplete(berkas, 'DATA_UKUR')) {
    return 'DATA_UKUR'
  }
  if (!isSectionComplete(berkas, 'DATA_PEMETAAN')) {
    return 'DATA_PEMETAAN'
  }
  // All sections complete, move to QC stage
  return 'KKS'
}

/**
 * Helper: Detect which section is being edited
 */
function detectEditedSection(updatedFields: string[]): BerkasSection[] {
  const sections: BerkasSection[] = []

  for (const [section, fields] of Object.entries(SECTION_FIELDS)) {
    if (updatedFields.some((field) => fields.includes(field))) {
      sections.push(section as BerkasSection)
    }
  }

  return sections.length > 0 ? sections : ['DATA_BERKAS'] // Default ke DATA_BERKAS jika tidak ada field cocok
}

/**
 * Helper: Filter data untuk hanya field yang diizinkan
 */
function filterDataByEditableSections(
  data: Record<string, any>,
  editableSections: BerkasSection[]
): Record<string, any> {
  const allowedFields = editableSections.flatMap((section) => SECTION_FIELDS[section])

  const filtered: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      filtered[key] = value
    }
  }

  return filtered
}

export async function PUT(
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

    // Validasi basic permission
    if (!canPerformAction(user.role, 'edit')) {
      return NextResponse.json(
        {
          error: `Forbidden: Your role "${user.role}" cannot edit berkas`,
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

    // Check if berkas is already completed (SELESAI)
    if (existingBerkas.statusBerkas === 'SELESAI') {
      return NextResponse.json(
        { error: 'Berkas yang sudah selesai tidak dapat diedit' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const updatedFieldKeys = Object.keys(body)

    // Detect edited sections BEFORE filtering
    const editedSections = detectEditedSection(updatedFieldKeys)

    // FIRST: Filter to only allowed fields for this user's role
    // This ensures we only process fields the user is allowed to edit
    const allowedFieldsByRole: Record<string, string[]> = {
      ADMIN: Object.values(SECTION_FIELDS).flat(),
      DATA_BERKAS: SECTION_FIELDS.DATA_BERKAS,
      DATA_UKUR: [...SECTION_FIELDS.DATA_BERKAS, ...SECTION_FIELDS.DATA_UKUR],
      DATA_PEMETAAN: [...SECTION_FIELDS.DATA_BERKAS, ...SECTION_FIELDS.DATA_PEMETAAN],
    }
    
    const roleAllowedFields = allowedFieldsByRole[user.role] || SECTION_FIELDS.DATA_BERKAS
    
    // Filter body to only include fields the user's role is allowed to edit
    const filteredBody: Record<string, any> = {}
    for (const [key, value] of Object.entries(body)) {
      if (roleAllowedFields.includes(key)) {
        filteredBody[key] = value
      }
    }

    // NOW detect sections from filtered fields
    const filteredFieldKeys = Object.keys(filteredBody)
    const allowedSections = detectEditedSection(filteredFieldKeys)

    // Validasi edit permission per section (should always pass now since we filtered)
    const unauthorizedSections = allowedSections.filter(
      (section) => !canEditSection(user.role, section)
    )

    if (unauthorizedSections.length > 0) {
      return NextResponse.json(
        {
          error: `Forbidden: Your role "${user.role}" cannot edit sections: ${unauthorizedSections.join(', ')}`,
          allowed_sections: allowedSections.filter((section) =>
            canEditSection(user.role, section)
          ),
        },
        { status: 403 }
      )
    }

    // Filter data untuk hanya field yang diizinkan
    const filteredData = filterDataByEditableSections(filteredBody, allowedSections)

    // Convert date fields if present
    const dataToUpdate: Record<string, any> = {}
    for (const [key, value] of Object.entries(filteredData)) {
      if (key.includes('tanggal') && value) {
        dataToUpdate[key] = new Date(value)
      } else if (key === 'biayaUkur' && value) {
        dataToUpdate[key] = parseFloat(value)
      } else {
        dataToUpdate[key] = value
      }
    }

    // Merge updated data with existing berkas to check section completion
    const mergedBerkas = { ...existingBerkas, ...dataToUpdate }

    // Determine next status based on section completion
    const newStatus = determineNextStatus(mergedBerkas)
    
    // Only update status if it should progress forward
    if (newStatus !== existingBerkas.statusBerkas && 
        ['DATA_BERKAS', 'DATA_UKUR', 'DATA_PEMETAAN', 'KKS'].includes(newStatus)) {
      dataToUpdate.statusBerkas = newStatus
    }

    // Update berkas with retry logic
    const updatedBerkas = await withRetry(
      () => prisma.berkas.update({
        where: { id: berkasId },
        data: dataToUpdate,
      }),
      { maxRetries: 2, delayMs: 100 }
    )

    // Log activity
    await prisma.riwayatBerkas.create({
      data: {
        berkasId: berkasId,
        statusLama: existingBerkas.statusBerkas,
        statusBaru: updatedBerkas.statusBerkas,
        diterima: user.name,
        catatan: `Berkas diedit oleh ${user.role}: ${user.name}. Section: ${editedSections.join(', ')}`,
      },
    })

    // Revalidate berkas pages
    revalidatePath('/berkas')
    revalidatePath(`/berkas/${berkasId}`)
    revalidatePath('/dashboard')

    return NextResponse.json({
      success: true,
      data: updatedBerkas,
      message: 'Berkas berhasil diperbarui',
      edited_sections: editedSections,
    })
  } catch (error: any) {
    console.error('Error updating berkas:', error.message || String(error))

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      // Unique constraint violation
      return NextResponse.json(
        { error: 'Nomor berkas sudah terdaftar. Gunakan nomor berkas yang berbeda.' },
        { status: 409 }
      )
    }

    if (error.code?.startsWith('P2')) {
      // Other Prisma validation errors
      return NextResponse.json(
        { error: 'Data tidak valid. Periksa kembali input Anda.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Gagal memperbarui berkas. Silakan coba lagi.' },
      { status: 500 }
    )
  }
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

    // Validasi permission
    if (!canPerformAction(user.role, 'delete')) {
      return NextResponse.json(
        {
          error: `Forbidden: Your role "${user.role}" cannot delete berkas`,
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

    // Check if berkas is already completed (SELESAI)
    if (existingBerkas.statusBerkas === 'SELESAI') {
      return NextResponse.json(
        { error: 'Berkas yang sudah selesai tidak dapat dihapus' },
        { status: 403 }
      )
    }

    // Delete berkas with retry logic
    await withRetry(
      () => prisma.berkas.delete({
        where: { id: berkasId },
      }),
      { maxRetries: 2, delayMs: 100 }
    )

    // Revalidate berkas list page
    revalidatePath('/berkas')
    revalidatePath('/dashboard')

    return NextResponse.json({
      success: true,
      message: 'Berkas berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Error deleting berkas:', error.message || String(error))
    return NextResponse.json(
      { error: 'Gagal menghapus berkas. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
