/**
 * Data Validation Report - Kecamatan dan Desa Cilacap
 * Generated: 2025-01-06
 */

import { KECAMATAN_CILACAP, DESA_CILACAP } from './constants'

interface ValidationReport {
  status: 'valid' | 'warning' | 'error'
  message: string
  details?: string[]
}

interface DetailedReport {
  timestamp: string
  totalKecamatan: number
  totalDesa: number
  kecamatanStatus: ValidationReport
  desaStatus: ValidationReport
  issues: {
    duplicateDesa: string[]
    emptyDesa: string[]
    mismatchedKecamatan: string[]
    inconsistentFormat: string[]
  }
  recommendations: string[]
}

export function validateCilacapData(): DetailedReport {
  const report: DetailedReport = {
    timestamp: new Date().toISOString(),
    totalKecamatan: KECAMATAN_CILACAP.length,
    totalDesa: 0,
    kecamatanStatus: { status: 'valid', message: '' },
    desaStatus: { status: 'valid', message: '' },
    issues: {
      duplicateDesa: [],
      emptyDesa: [],
      mismatchedKecamatan: [],
      inconsistentFormat: []
    },
    recommendations: []
  }

  // Validasi Kecamatan
  if (KECAMATAN_CILACAP.length === 26) {
    report.kecamatanStatus = {
      status: 'valid',
      message: '✓ Total 26 kecamatan sudah benar'
    }
  } else {
    report.kecamatanStatus = {
      status: 'error',
      message: `✗ Total kecamatan: ${KECAMATAN_CILACAP.length} (seharusnya 26)`
    }
  }

  // Validasi Desa
  let totalDesaCount = 0
  const allDesaNames = new Set<string>()
  const desaCountPerKecamatan: Record<string, number> = {}

  for (const [kecamatan, desaList] of Object.entries(DESA_CILACAP)) {
    desaCountPerKecamatan[kecamatan] = desaList.length
    totalDesaCount += desaList.length

    // Cek kecamatan yang ada di DESA_CILACAP tapi tidak di KECAMATAN_CILACAP
    if (!KECAMATAN_CILACAP.includes(kecamatan)) {
      report.issues.mismatchedKecamatan.push(
        `${kecamatan} ada di DESA_CILACAP tapi tidak di KECAMATAN_CILACAP`
      )
    }

    // Cek desa kosong atau undefined
    if (!desaList || desaList.length === 0) {
      report.issues.emptyDesa.push(kecamatan)
    }

    // Cek duplikasi dan format
    desaList.forEach((desa) => {
      if (allDesaNames.has(desa)) {
        report.issues.duplicateDesa.push(
          `${desa} (duplikasi di kecamatan yang berbeda)`
        )
      }
      allDesaNames.add(desa)

      // Cek format (tidak boleh hanya angka, tidak boleh kosong)
      if (!desa || desa.trim().length === 0) {
        report.issues.inconsistentFormat.push(
          `Desa kosong di kecamatan ${kecamatan}`
        )
      }
    })
  }

  report.totalDesa = totalDesaCount

  // Cek kecamatan yang ada di KECAMATAN_CILACAP tapi tidak di DESA_CILACAP
  KECAMATAN_CILACAP.forEach((kecamatan) => {
    if (!DESA_CILACAP[kecamatan]) {
      report.issues.mismatchedKecamatan.push(
        `${kecamatan} ada di KECAMATAN_CILACAP tapi tidak ada mapping di DESA_CILACAP`
      )
    }
  })

  // Analisis hasil validasi
  if (report.issues.mismatchedKecamatan.length > 0) {
    report.desaStatus.status = 'error'
    report.desaStatus.message = `✗ Ada ${report.issues.mismatchedKecamatan.length} ketidakcocokan kecamatan`
  } else if (report.issues.duplicateDesa.length > 0) {
    report.desaStatus.status = 'warning'
    report.desaStatus.message = `⚠ Ada ${report.issues.duplicateDesa.length} desa yang terulang`
  } else if (report.issues.emptyDesa.length > 0) {
    report.desaStatus.status = 'warning'
    report.desaStatus.message = `⚠ Ada ${report.issues.emptyDesa.length} kecamatan dengan desa kosong`
  } else {
    report.desaStatus.status = 'valid'
    report.desaStatus.message = `✓ Total ${totalDesaCount} desa`
  }

  // Rekomendasi
  if (report.issues.mismatchedKecamatan.length > 0) {
    report.recommendations.push(
      'Perbaiki ketidakcocokan antara KECAMATAN_CILACAP dan DESA_CILACAP'
    )
  }

  report.recommendations.push(
    'Verifikasi dengan BPS Cilacap untuk memastikan semua desa terdaftar dengan benar'
  )

  report.recommendations.push(
    'Hubungi BPS Cilacap: (0282) 534328 untuk data terbaru'
  )

  report.recommendations.push(
    'Periksa website: https://cilacapkab.bps.go.id/ untuk update data'
  )

  return report
}

// Helper function untuk mendapatkan statistik per kecamatan
export function getKecamatanStats() {
  const stats: Record<string, { desa: number; names: string[] }> = {}

  for (const [kecamatan, desaList] of Object.entries(DESA_CILACAP)) {
    stats[kecamatan] = {
      desa: desaList.length,
      names: desaList
    }
  }

  return stats
}

// Print validation report
if (typeof window !== 'undefined') {
  console.log('=== CILACAP DATA VALIDATION REPORT ===')
  console.log(validateCilacapData())
}
