'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Berkas } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { UserRole } from '@/lib/auth/roles'

interface BerkasQCProps {
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
}

export function BerkasQC({ berkas }: BerkasQCProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [canEditQC, setCanEditQC] = useState(false)
  
  useEffect(() => {
    const user = getCurrentUser()
    const isAdmin = hasRole(UserRole.ADMIN)
    const isQC = hasRole(UserRole.QUALITY_CONTROL)
    setCanEditQC(isAdmin || isQC)
    setIsHydrated(true)
  }, [])

  // KKS QC Section
  const [showKksRevisiForm, setShowKksRevisiForm] = useState(false)
  const [kksAccStatus, setKksAccStatus] = useState<'Ya' | 'Revisi' | null>(
    berkas.qcKksStatus === 'ACC' ? 'Ya' : berkas.qcKksStatus === 'REVISI' ? 'Revisi' : null
  )
  const [kksKeterangan, setKksKeterangan] = useState(berkas.qcKksKeterangan || '')

  // KASI QC Section
  const [showKasiRevisiForm, setShowKasiRevisiForm] = useState(false)
  const [kasiAccStatus, setKasiAccStatus] = useState<'Ya' | 'Revisi' | null>(
    berkas.qcKasiStatus === 'ACC' ? 'Ya' : berkas.qcKasiStatus === 'REVISI' ? 'Revisi' : null
  )
  const [kasiKeterangan, setKasiKeterangan] = useState(berkas.qcKasiKeterangan || '')

  const handleKksSubmit = async () => {
    if (!kksAccStatus) {
      alert('Pilih keputusan ACC atau Revisi')
      return
    }

    if (kksAccStatus === 'Revisi' && !kksKeterangan.trim()) {
      alert('Keterangan Revisi wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/berkas/${berkas.id}/qc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qcType: 'KKS',
          qcStatus: kksAccStatus === 'Ya' ? 'ACC' : 'REVISI',
          keterangan: kksKeterangan || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.error}`)
        return
      }

      const result = await response.json()
      alert(result.message)
      
      // Reset form state setelah submit
      setKksAccStatus(null)
      setKksKeterangan('')
      setShowKksRevisiForm(false)
      
      router.refresh()
    } catch (error: any) {
      alert('Error: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKasiSubmit = async () => {
    if (!kasiAccStatus) {
      alert('Pilih keputusan ACC atau Revisi')
      return
    }

    if (kasiAccStatus === 'Revisi' && !kasiKeterangan.trim()) {
      alert('Keterangan Revisi wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/berkas/${berkas.id}/qc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qcType: 'KASI',
          qcStatus: kasiAccStatus === 'Ya' ? 'ACC' : 'REVISI',
          keterangan: kasiKeterangan || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.error}`)
        return
      }

      const result = await response.json()
      alert(result.message)
      
      // Reset form state setelah submit
      setKasiAccStatus(null)
      setKasiKeterangan('')
      setShowKasiRevisiForm(false)
      
      router.refresh()
    } catch (error: any) {
      alert('Error: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Only show QC sections if berkas is at KKS or KASI stage (or after)
  // Show the sections regardless of status to allow QC team to work ahead
  const isKksDone = berkas.qcKksStatus !== null
  const isKasiDone = berkas.qcKasiStatus !== null

  // Validasi kelengkapan data
  const isDataBerkasComplete = !!(
    berkas.noBerkas &&
    berkas.namaPemohon &&
    berkas.jenisPermohonan &&
    berkas.kecamatan &&
    berkas.desa &&
    berkas.statusTanah &&
    berkas.luas &&
    berkas.nib &&
    berkas.tanggalBerkas
  )

  const isDataUkurComplete = !!(
    berkas.koordinatorUkur &&
    berkas.petugasUkur &&
    berkas.noGu &&
    berkas.noStpPersiapuanUkur &&
    berkas.tanggalStpPersiapuan &&
    berkas.posisiBerkasUkur
  )

  const isDataPemetaanComplete = !!(
    (berkas as any).petugasPemetaan &&
    (berkas as any).posisiBerkasMetaan
  )

  const isAllDataComplete = isDataBerkasComplete && isDataUkurComplete && isDataPemetaanComplete
  const canShowQCForm = canEditQC && isAllDataComplete

  // Prevent hydration mismatch by only rendering conditional content after hydration
  if (!isHydrated) {
    return (
      <div className="space-y-6">
        {/* Loading placeholder */}
        <Card className="p-6 border-2 border-indigo-200 bg-indigo-50">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-700 font-bold">KKS</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Quality Control - KKS</h3>
          </div>
          <div className="h-20 bg-slate-100 rounded animate-pulse"></div>
        </Card>
        <Card className="p-6 border-2 border-indigo-200 bg-indigo-50">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-700 font-bold">KASI</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Quality Control - KASI</h3>
          </div>
          <div className="h-20 bg-slate-100 rounded animate-pulse"></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quality Control - KKS */}
      <Card className="p-6 border-2 border-indigo-200 bg-indigo-50">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-700 font-bold">KKS</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Quality Control - KKS (Koordinator Kelompok Substansi)
            </h3>
          </div>

          {berkas.qcKksStatus && berkas.qcKksStatus === 'ACC' ? (
            // Already ACC - show result only
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white border border-slate-200">
                <CheckCircle2 size={24} className="text-green-600" />
                <div>
                  <p className="font-semibold text-slate-900">ACC ✓</p>
                  <p className="text-sm text-slate-600">
                    Oleh: {berkas.qcKksOleh} pada{' '}
                    {berkas.qcKksTanggal
                      ? new Date(berkas.qcKksTanggal).toLocaleDateString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>
              {berkas.qcKksKeterangan && (
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600">
                    <strong>Keterangan:</strong> {berkas.qcKksKeterangan}
                  </p>
                </div>
              )}
            </div>
          ) : canShowQCForm || (berkas.qcKksStatus === 'REVISI' && canEditQC) ? (
            // Form to submit (or resubmit after REVISI)
            <div className="space-y-4">
              {berkas.qcKksStatus === 'REVISI' && (
                <div className="p-4 bg-orange-100 border-2 border-orange-400 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle size={24} className="text-orange-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900">Status: REVISI</p>
                      <p className="text-sm text-orange-700">
                        Terakhir oleh: {berkas.qcKksOleh} pada{' '}
                        {berkas.qcKksTanggal
                          ? new Date(berkas.qcKksTanggal).toLocaleDateString('id-ID')
                          : '-'}
                      </p>
                      {berkas.qcKksKeterangan && (
                        <p className="text-sm text-orange-700 mt-1">
                          <strong>Keterangan:</strong> {berkas.qcKksKeterangan}
                        </p>
                      )}
                      <p className="text-sm text-orange-800 mt-2 font-semibold">
                        ⚠ Silakan review ulang dan submit keputusan baru
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <p className="font-medium text-slate-900 mb-4">
                  Apakah berkas telah di ACC?
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="kks-status"
                      value="Ya"
                      checked={kksAccStatus === 'Ya'}
                      onChange={(e) => {
                        setKksAccStatus('Ya')
                        setShowKksRevisiForm(false)
                      }}
                      className="w-4 h-4"
                    />
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={20} className="text-green-600" />
                      <span className="text-slate-900">Ya (ACC)</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="kks-status"
                      value="Revisi"
                      checked={kksAccStatus === 'Revisi'}
                      onChange={(e) => {
                        setKksAccStatus('Revisi')
                        setShowKksRevisiForm(true)
                      }}
                      className="w-4 h-4"
                    />
                    <span className="flex items-center gap-2">
                      <XCircle size={20} className="text-orange-600" />
                      <span className="text-slate-900">Revisi</span>
                    </span>
                  </label>
                </div>
              </div>

              {showKksRevisiForm && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Keterangan Revisi (Wajib) *
                  </label>
                  <textarea
                    value={kksKeterangan}
                    onChange={(e) => setKksKeterangan(e.target.value)}
                    placeholder="Jelaskan alasan revisi..."
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>
              )}

              {kksAccStatus === 'Ya' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Keterangan (Opsional)
                  </label>
                  <textarea
                    value={kksKeterangan}
                    onChange={(e) => setKksKeterangan(e.target.value)}
                    placeholder="Tambahkan keterangan jika diperlukan..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              )}

              <Button
                onClick={handleKksSubmit}
                disabled={isSubmitting || !kksAccStatus}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium"
              >
                {kksAccStatus === 'Ya' ? '✓ Submit ACC & Lanjutkan ke KASI' : '✗ Submit REVISI (Dapat Diulang)'}
              </Button>
            </div>
          ) : !canEditQC ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-600">
              Hanya Admin dan Quality Control yang dapat mengisi QC KKS
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="flex gap-3 items-start">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-2">Tunggu hingga semua data diisi lengkap</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center gap-2 ${isDataBerkasComplete ? 'text-green-700' : 'text-yellow-700'}`}>
                      <span>{isDataBerkasComplete ? '✓' : '○'}</span> Data Berkas
                    </li>
                    <li className={`flex items-center gap-2 ${isDataUkurComplete ? 'text-green-700' : 'text-yellow-700'}`}>
                      <span>{isDataUkurComplete ? '✓' : '○'}</span> Data Ukur
                    </li>
                    <li className={`flex items-center gap-2 ${isDataPemetaanComplete ? 'text-green-700' : 'text-yellow-700'}`}>
                      <span>{isDataPemetaanComplete ? '✓' : '○'}</span> Data Pemetaan
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </Card>

      {/* Quality Control - Kepala Seksi */}
      <Card className="p-6 border-2 border-pink-200 bg-pink-50">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-pink-700 font-bold">KASI</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Quality Control - Kepala Seksi
            </h3>
          </div>

          {berkas.qcKasiStatus && berkas.qcKasiStatus === 'ACC' ? (
            // Already ACC - show result only
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white border border-slate-200">
                <CheckCircle2 size={24} className="text-green-600" />
                <div>
                  <p className="font-semibold text-slate-900">ACC ✓</p>
                  <p className="text-sm text-slate-600">
                    Oleh: {berkas.qcKasiOleh} pada{' '}
                    {berkas.qcKasiTanggal
                      ? new Date(berkas.qcKasiTanggal).toLocaleDateString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>
              {berkas.qcKasiKeterangan && (
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600">
                    <strong>Keterangan:</strong> {berkas.qcKasiKeterangan}
                  </p>
                </div>
              )}
            </div>
          ) : !canEditQC ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-600">
              Hanya Admin dan Quality Control yang dapat mengisi QC Kepala Seksi
            </div>
          ) : berkas.qcKksStatus !== 'ACC' ? (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="flex gap-3 items-start">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Tunggu hingga QC KKS sudah di-ACC terlebih dahulu</p>
                </div>
              </div>
            </div>
          ) : !isAllDataComplete && berkas.qcKasiStatus !== 'REVISI' ? (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="flex gap-3 items-start">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-2">Tunggu hingga semua data diisi lengkap</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center gap-2 ${isDataBerkasComplete ? 'text-green-700' : 'text-yellow-700'}`}>
                      <span>{isDataBerkasComplete ? '✓' : '○'}</span> Data Berkas
                    </li>
                    <li className={`flex items-center gap-2 ${isDataUkurComplete ? 'text-green-700' : 'text-yellow-700'}`}>
                      <span>{isDataUkurComplete ? '✓' : '○'}</span> Data Ukur
                    </li>
                    <li className={`flex items-center gap-2 ${isDataPemetaanComplete ? 'text-green-700' : 'text-yellow-700'}`}>
                      <span>{isDataPemetaanComplete ? '✓' : '○'}</span> Data Pemetaan
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {berkas.qcKasiStatus === 'REVISI' && (
                <div className="p-4 bg-orange-100 border-2 border-orange-400 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle size={24} className="text-orange-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900">Status: REVISI</p>
                      <p className="text-sm text-orange-700">
                        Terakhir oleh: {berkas.qcKasiOleh} pada{' '}
                        {berkas.qcKasiTanggal
                          ? new Date(berkas.qcKasiTanggal).toLocaleDateString('id-ID')
                          : '-'}
                      </p>
                      {berkas.qcKasiKeterangan && (
                        <p className="text-sm text-orange-700 mt-1">
                          <strong>Keterangan:</strong> {berkas.qcKasiKeterangan}
                        </p>
                      )}
                      <p className="text-sm text-orange-800 mt-2 font-semibold">
                        ⚠ Silakan review ulang dan submit keputusan baru
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <p className="font-medium text-slate-900 mb-4">
                  Apakah berkas telah di ACC?
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="kasi-status"
                      value="Ya"
                      checked={kasiAccStatus === 'Ya'}
                      onChange={(e) => {
                        setKasiAccStatus('Ya')
                        setShowKasiRevisiForm(false)
                      }}
                      className="w-4 h-4"
                    />
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={20} className="text-green-600" />
                      <span className="text-slate-900">Ya (ACC)</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="kasi-status"
                      value="Revisi"
                      checked={kasiAccStatus === 'Revisi'}
                      onChange={(e) => {
                        setKasiAccStatus('Revisi')
                        setShowKasiRevisiForm(true)
                      }}
                      className="w-4 h-4"
                    />
                    <span className="flex items-center gap-2">
                      <XCircle size={20} className="text-orange-600" />
                      <span className="text-slate-900">Revisi</span>
                    </span>
                  </label>
                </div>
              </div>

              {showKasiRevisiForm && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Keterangan Revisi (Wajib) *
                  </label>
                  <textarea
                    value={kasiKeterangan}
                    onChange={(e) => setKasiKeterangan(e.target.value)}
                    placeholder="Jelaskan alasan revisi..."
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>
              )}

              {kasiAccStatus === 'Ya' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Keterangan (Opsional)
                  </label>
                  <textarea
                    value={kasiKeterangan}
                    onChange={(e) => setKasiKeterangan(e.target.value)}
                    placeholder="Tambahkan keterangan jika diperlukan..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              )}

              <Button
                onClick={handleKasiSubmit}
                disabled={isSubmitting || !kasiAccStatus}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium"
              >
                {kasiAccStatus === 'Ya' ? '✓ Submit ACC & Selesaikan Berkas' : '✗ Submit REVISI (Dapat Diulang)'}
              </Button>
            </div>
          )}
        </Card>
    </div>
  )
}
