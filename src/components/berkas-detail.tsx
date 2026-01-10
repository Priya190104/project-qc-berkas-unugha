'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Berkas } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { STATUS_COLORS, STATUS_LABELS, formatDate } from '@/lib/constants'
import { BerkasJourneyTimeline } from './berkas-journey-timeline'
import { BerkasQC } from './berkas-qc'

interface BerkasDetailProps {
  berkas: Berkas
  riwayat?: any[]
}

export function BerkasDetail({ berkas, riwayat = [] }: BerkasDetailProps) {
  const router = useRouter()
  const { useCanAction } = require('@/lib/auth/hooks')
  const canEdit = useCanAction('edit') && berkas.statusBerkas !== 'SELESAI'

  const renderField = (label: string, value: any, highlight = false) => {
    return (
      <div className={`py-3 px-4 border-b border-slate-100 ${highlight ? 'bg-blue-50' : ''}`}>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</p>
        <p className="text-sm text-slate-900 mt-1">{value || '-'}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Detail Berkas</h1>
              <p className="text-slate-600">No. Berkas: {berkas.noBerkas}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Link href={`/berkas/${berkas.id}/edit`}>
                <Button className="bg-green-600 hover:bg-green-700">Edit Berkas</Button>
              </Link>
            )}
            <Link href="/berkas">
              <Button variant="outline">Kembali ke Daftar</Button>
            </Link>
          </div>
        </div>

        {/* Status Berkas */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Status Berkas</h3>
              <p className="text-sm text-slate-600 mt-1">Tgl Masuk: {formatDate(berkas.tanggalBerkas)}</p>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${STATUS_COLORS[berkas.statusBerkas as keyof typeof STATUS_COLORS]}`}>
              {STATUS_LABELS[berkas.statusBerkas as keyof typeof STATUS_LABELS]}
            </span>
          </div>
        </Card>

        {/* Informasi Utama Berkas */}
        <Card>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Informasi Utama Berkas</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {renderField('No. Berkas', berkas.noBerkas, true)}
            {renderField('DI 302', berkas.di302)}
            {renderField('Tanggal 302', formatDate(berkas.tanggal302))}
            {renderField('Jenis Permohonan', berkas.jenisPermohonan)}
          </div>
        </Card>

        {/* Informasi Pemohon */}
        <Card>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Informasi Pemohon</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {renderField('Nama Pemohon', berkas.namaPemohon, true)}
          </div>
        </Card>

        {/* Informasi Lokasi */}
        <Card>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Informasi Lokasi</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {renderField('Kecamatan', berkas.kecamatan, true)}
            {renderField('Desa', berkas.desa)}
          </div>
        </Card>

        {/* Data Tanah */}
        <Card>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Data Tanah</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {renderField('Status Tanah', berkas.statusTanah, true)}
            {renderField('Keadaan Tanah', (berkas as any).keadaanTanah || '-')}
            {renderField('Luas', berkas.luas)}
            {renderField('Luas 302', (berkas as any).luas302 || '-')}
            {renderField('No. 305 (NIB)', berkas.nib)}
            {renderField('Notaris', berkas.notaris)}
            {renderField('Biaya Ukur', berkas.biayaUkur ? `Rp ${berkas.biayaUkur.toLocaleString('id-ID')}` : null)}
          </div>
        </Card>

        {/* Data Ukur */}
        <Card>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Data Ukur</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {renderField('Koordinator Ukur', berkas.koordinatorUkur, true)}
            {renderField('NIP', berkas.nip)}
            {renderField('Surat Tugas An.', berkas.suratTugasAn)}
            {renderField('Petugas Ukur', berkas.petugasUkur)}
            {renderField('No. GU', berkas.noGu)}
            {renderField('No. STP Persiapuan Ukur', berkas.noStpPersiapuanUkur)}
            {renderField('Tgl STP Persiapuan', formatDate(berkas.tanggalStpPersiapuan))}
            {renderField('Posisi Berkas Ukur', berkas.posisiBerkasUkur)}
          </div>
        </Card>

        {/* Data Pemetaan */}
        <Card>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Data Pemetaan</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {renderField('Petugas Pemetaan', (berkas as any).petugasPemetaan || '-', true)}
            {renderField('Posisi Berkas Metaan', (berkas as any).posisiBerkasMetaan || '-')}
            {renderField('Keterangan Pemetaan', (berkas as any).keteranganPemetaan || '-')}
          </div>
        </Card>

        {/* Quality Control Sections */}
        <div className="pt-4">
          <BerkasQC berkas={berkas} />
        </div>

        {/* Keterangan */}
        {berkas.keterangan && (
          <Card>
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Keterangan</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{berkas.keterangan}</p>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="flex gap-3 justify-center pb-6">
          <Link href="/berkas">
            <Button variant="outline">Kembali ke Daftar</Button>
          </Link>
          {canEdit && (
            <Link href={`/berkas/${berkas.id}/edit`}>
              <Button className="bg-green-600 hover:bg-green-700">Edit Berkas</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <BerkasJourneyTimeline berkas={berkas} riwayat={riwayat} />
      </div>
    </div>
  )
}
