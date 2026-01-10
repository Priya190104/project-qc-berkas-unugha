'use client'

import { Berkas } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/constants'

interface RiwayatEntry {
  id: string
  berkasId: string
  statusLama: string
  statusBaru: string
  diterima: string | null
  catatan: string | null
  createdAt: Date
}

interface JourneyStage {
  id: string
  name: string
  label: string
  status: 'completed' | 'active' | 'pending'
  officer: string | null
  timestamp: Date | null
  description?: string
}

// Helper function to determine stage progression based on filled data
function determineJourneyStages(
  berkas: Berkas & {
    qcKksStatus?: string | null
    qcKksOleh?: string | null
    qcKksTanggal?: Date | null
    qcKasiStatus?: string | null
    qcKasiOleh?: string | null
    qcKasiTanggal?: Date | null
  },
  riwayat: RiwayatEntry[] = []
): JourneyStage[] {
  const stages: JourneyStage[] = [
    {
      id: 'data_berkas',
      name: 'Diterima oleh Petugas Data Berkas',
      label: 'Data Berkas',
      status: 'completed',
      officer: berkas.namaPemohon ? 'Data Berkas' : null,
      timestamp: berkas.tanggalBerkas,
    },
    {
      id: 'data_ukur',
      name: 'Diterima oleh Petugas Data Ukur',
      label: 'Data Ukur',
      status: 'pending',
      officer: null,
      timestamp: null,
    },
    {
      id: 'pemetaan',
      name: 'Diterima oleh Petugas Pemetaan',
      label: 'Pemetaan',
      status: 'pending',
      officer: null,
      timestamp: null,
    },
    {
      id: 'kks',
      name: 'Diterima oleh Koordinator Kelompok Substansi',
      label: 'KKS',
      status: 'pending',
      officer: null,
      timestamp: null,
    },
    {
      id: 'kasi',
      name: 'Diterima oleh Kepala Seksi',
      label: 'Kepala Seksi',
      status: 'pending',
      officer: null,
      timestamp: null,
    },
    {
      id: 'selesai',
      name: 'Selesai',
      label: 'Selesai',
      status: 'pending',
      officer: null,
      timestamp: null,
    },
  ]

  // Determine active stage based on filled data and statusBerkas
  let activeStageIndex = -1

  // Check data completion
  const isDataBerkasComplete = !!(berkas.noBerkas && berkas.namaPemohon && berkas.jenisPermohonan)
  const isDataUkurComplete = !!(berkas.petugasUkur && berkas.koordinatorUkur)
  const isDataPemetaanComplete = !!(berkas.petugasPemetaan)

  // Determine active stage based on statusBerkas
  if (berkas.statusBerkas === 'DATA_BERKAS') {
    activeStageIndex = 0
    stages[0].status = 'active'
  } else if (berkas.statusBerkas === 'DATA_UKUR') {
    activeStageIndex = 1
    stages[1].officer = berkas.petugasUkur || null
    stages[1].status = 'active'
  } else if (berkas.statusBerkas === 'DATA_PEMETAAN' || berkas.statusBerkas === 'PEMETAAN') {
    activeStageIndex = 2
    stages[2].officer = berkas.petugasPemetaan || null
    stages[2].status = 'active'
  } else if (berkas.statusBerkas === 'KKS') {
    activeStageIndex = 3
    stages[3].status = 'active'
    // Add QC KKS info if available
    if (berkas.qcKksOleh) {
      stages[3].officer = berkas.qcKksOleh
      if (berkas.qcKksStatus === 'ACC') {
        stages[3].status = 'completed'
      }
    }
    if (berkas.qcKksTanggal) {
      stages[3].timestamp = berkas.qcKksTanggal
    }
  }

  // Mark KASI stage
  if (berkas.statusBerkas === 'KASI') {
    activeStageIndex = 4
    stages[4].status = 'active'
    // Add QC KASI info if available
    if (berkas.qcKasiOleh) {
      stages[4].officer = berkas.qcKasiOleh
      if (berkas.qcKasiStatus === 'ACC') {
        stages[4].status = 'completed'
      }
    }
    if (berkas.qcKasiTanggal) {
      stages[4].timestamp = berkas.qcKasiTanggal
    }
  }

  // Mark Selesai stage
  if (berkas.statusBerkas === 'SELESAI') {
    activeStageIndex = 5
    stages[5].status = 'completed'
  }

  // Mark all stages before active as completed
  for (let i = 0; i < activeStageIndex; i++) {
    if (stages[i].status !== 'completed') {
      stages[i].status = 'completed'
    }
  }

  // Get most recent riwayat entries for stage timestamps
  const riwayatByStatus: Record<string, RiwayatEntry> = {}
  riwayat.forEach((entry) => {
    if (!riwayatByStatus[entry.statusBaru]) {
      riwayatByStatus[entry.statusBaru] = entry
    }
  })

  // Update timestamps from riwayat if available
  if (riwayatByStatus['DATA_UKUR']) {
    stages[1].timestamp = riwayatByStatus['DATA_UKUR'].createdAt
  }
  if (riwayatByStatus['PEMETAAN']) {
    stages[2].timestamp = riwayatByStatus['PEMETAAN'].createdAt
  }
  if (riwayatByStatus['KKS']) {
    stages[3].timestamp = riwayatByStatus['KKS'].createdAt
  }
  if (riwayatByStatus['KASI']) {
    stages[4].timestamp = riwayatByStatus['KASI'].createdAt
  }
  if (riwayatByStatus['SELESAI']) {
    stages[5].timestamp = riwayatByStatus['SELESAI'].createdAt
  }

  return stages
}

export function BerkasJourneyTimeline({
  berkas,
  riwayat,
}: {
  berkas: Berkas & {
    qcKksStatus?: string | null
    qcKksKeterangan?: string | null
    qcKksOleh?: string | null
    qcKksTanggal?: Date | null
    qcKasiStatus?: string | null
    qcKasiKeterangan?: string | null
    qcKasiOleh?: string | null
    qcKasiTanggal?: Date | null
  }
  riwayat: RiwayatEntry[]
}) {
  const stages = determineJourneyStages(berkas, riwayat)

  const getStatusColor = (status: 'completed' | 'active' | 'pending', stageId?: string) => {
    if (status === 'completed') {
      return 'bg-green-50 border-green-200 text-green-900'
    }
    if (status === 'active') {
      return 'bg-blue-50 border-blue-200 text-blue-900'
    }
    return 'bg-slate-50 border-slate-200 text-slate-600'
  }

  const getStatusBadgeColor = (status: 'completed' | 'active' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'active':
        return 'bg-blue-100 text-blue-700'
      case 'pending':
        return 'bg-slate-100 text-slate-500'
    }
  }

  const getCircleColor = (status: 'completed' | 'active' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'active':
        return 'bg-blue-500'
      case 'pending':
        return 'bg-slate-300'
    }
  }

  const getLineColor = (status: 'completed' | 'active' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'bg-green-300'
      case 'active':
        return 'bg-blue-300'
      case 'pending':
        return 'bg-slate-200'
    }
  }

  return (
    <Card className="sticky top-6 h-fit border-0 shadow-lg">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
        <h3 className="text-base font-bold text-white">📍 Riwayat Perjalanan Berkas</h3>
      </div>

      <div className="p-4 space-y-3">
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1
          return (
            <div key={stage.id}>
              {/* Timeline item */}
              <div className="flex gap-3">
                {/* Timeline line and circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${getCircleColor(stage.status)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {stage.status === 'completed' ? '✓' : stage.status === 'active' ? '●' : '○'}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-16 my-1 ${getLineColor(stage.status)}`} />
                  )}
                </div>

                {/* Stage content */}
                <div className="flex-1 pb-2">
                  <div className={`rounded-lg border px-4 py-3 ${getStatusColor(stage.status, stage.id)}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{stage.label}</h4>
                        <p className="text-xs mt-0.5 opacity-75">{stage.name}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getStatusBadgeColor(stage.status)}`}>
                        {stage.status === 'completed' ? 'Selesai' : stage.status === 'active' ? 'Sedang' : 'Menunggu'}
                      </span>
                    </div>

                    {/* Officer and timestamp info */}
                    {stage.officer && stage.timestamp ? (
                      <div className="mt-2 text-xs space-y-1">
                        <p><span className="font-medium">{stage.officer}</span></p>
                        <p className="opacity-70">{formatDate(stage.timestamp)} · {new Date(stage.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ) : stage.status === 'pending' ? (
                      <div className="mt-2 text-xs text-slate-500">
                        ⏳ Menunggu diproses
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-100">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-700">Selesai</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-700">Sedang diproses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <span className="text-slate-700">Menunggu diproses</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
