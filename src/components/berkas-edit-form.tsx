'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Berkas } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Plus } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { JENIS_PERMOHONAN, KECAMATAN_CILACAP, DESA_CILACAP } from '@/lib/constants'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { AddPetugasModal } from '@/components/ui/add-petugas-modal'
import { ManagePetugasModal } from '@/components/ui/manage-petugas-modal'
import { canEditSection } from '@/lib/auth/roles'

interface PetugasItem {
  id?: string
  nama: string
  nip?: string
}

interface BerkasEditFormProps {
  berkas: Berkas
}

interface FormDataType {
  noBerkas: string
  di302: string
  tanggal302: string
  namaPemohon: string
  jenisPermohonan: string
  statusTanah: string
  keadaanTanah: string
  kecamatan: string
  desa: string
  luas: string
  luas302: string
  luasSU: string
  no305: string
  nib: string
  notaris: string
  biayaUkur: string
  tanggalBerkas: string
  keterangan: string
  koordinatorUkur: string
  nip: string
  suratTugasAn: string
  petugasUkur: string
  noGu: string
  noStpPersiapuanUkur: string
  tanggalStpPersiapuan: string
  noStp: string
  tanggalStp: string
  posisiBerkasUkur: string
  petugasPemetaan: string
  posisiBerkasMetaan: string
  keteranganPemetaan: string
}

export function BerkasEditForm({ berkas }: BerkasEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState<FormDataType>({
    noBerkas: berkas.noBerkas || '',
    di302: berkas.di302 || '',
    tanggal302: berkas.tanggal302 ? new Date(berkas.tanggal302).toISOString().split('T')[0] : '',
    namaPemohon: berkas.namaPemohon || '',
    jenisPermohonan: berkas.jenisPermohonan || '',
    statusTanah: berkas.statusTanah || '',
    keadaanTanah: (berkas as any).keadaanTanah || '',
    kecamatan: berkas.kecamatan || '',
    desa: berkas.desa || '',
    luas: berkas.luas || '',
    luas302: (berkas as any).luas302 || '',
    luasSU: (berkas as any).luasSU || '',
    no305: (berkas as any).no305 || '',
    nib: berkas.nib || '',
    notaris: berkas.notaris || '',
    biayaUkur: berkas.biayaUkur?.toString() || '',
    tanggalBerkas: berkas.tanggalBerkas ? new Date(berkas.tanggalBerkas).toISOString().split('T')[0] : '',
    keterangan: berkas.keterangan || '',
    koordinatorUkur: berkas.koordinatorUkur || '',
    nip: berkas.nip || '',
    suratTugasAn: berkas.suratTugasAn || '',
    petugasUkur: berkas.petugasUkur || '',
    noGu: berkas.noGu || '',
    noStpPersiapuanUkur: berkas.noStpPersiapuanUkur || '',
    tanggalStpPersiapuan: berkas.tanggalStpPersiapuan ? new Date(berkas.tanggalStpPersiapuan).toISOString().split('T')[0] : '',
    noStp: (berkas as any).noStp || '',
    tanggalStp: (berkas as any).tanggalStp || '',
    posisiBerkasUkur: berkas.posisiBerkasUkur || '',
    petugasPemetaan: (berkas as any).petugasPemetaan || '',
    posisiBerkasMetaan: (berkas as any).posisiBerkasMetaan || '',
    keteranganPemetaan: (berkas as any).keteranganPemetaan || '',
  })

  const [koordinatorUkurList, setKoordinatorUkurList] = useState<PetugasItem[]>([])
  const [petugasUkurList, setPetugasUkurList] = useState<PetugasItem[]>([])
  const [petugasPemetaanList, setPetugasPemetaanList] = useState<PetugasItem[]>([])
  const [showAddKoordinator, setShowAddKoordinator] = useState(false)
  const [showAddPetugasUkur, setShowAddPetugasUkur] = useState(false)
  const [showAddPetugasPemetaan, setShowAddPetugasPemetaan] = useState(false)
  const [showManageKoordinator, setShowManageKoordinator] = useState(false)
  const [showManagePetugasUkur, setShowManagePetugasUkur] = useState(false)
  const [showManagePetugasPemetaan, setShowManagePetugasPemetaan] = useState(false)

  const kecamatanOptions = Object.keys(KECAMATAN_CILACAP)
  const desaOptions = formData.kecamatan ? (DESA_CILACAP[formData.kecamatan] || []) : []

  const koordinatorOptions = koordinatorUkurList.map(item => item.nama)
  const petugasUkurOptions = petugasUkurList.map(item => item.nama)
  const petugasPemetaanOptions = petugasPemetaanList.map(item => item.nama)

  const existingKoordinatorNames = koordinatorUkurList.map(k => k.nama)
  const existingPetugasUkurNames = petugasUkurList.map(p => p.nama)
  const existingPetugasPemetaanNames = petugasPemetaanList.map(p => p.nama)

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const currentUser = getCurrentUser()
      const token = localStorage.getItem('token')

      if (!currentUser || !token) {
        router.push('/login')
        setIsLoading(false)
        return
      }

      setUser(currentUser)
      setIsAuthorized(true)
      setIsLoading(false)
      fetchPetugasData()
    }

    checkAuth()
  }, [router])

  const fetchPetugasData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/petugas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch petugas')
      const result = await response.json()
      const data = Array.isArray(result) ? result : result.data || []
      
      const koordinator = data.filter((p: any) => p.tipe === 'KOORDINATOR_UKUR')
      const petugasUkur = data.filter((p: any) => p.tipe === 'PETUGAS_UKUR')
      const petugasPemetaan = data.filter((p: any) => p.tipe === 'PETUGAS_PEMETAAN')
      
      setKoordinatorUkurList(koordinator)
      setPetugasUkurList(petugasUkur)
      setPetugasPemetaanList(petugasPemetaan)
    } catch (error) {
      console.error('Error fetching petugas:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectKoordinator = (value: string) => {
    const selected = koordinatorUkurList.find(item => item.nama === value)
    setFormData(prev => ({
      ...prev,
      koordinatorUkur: value,
      nip: selected ? selected.nip || '' : '',
    }))
  }

  const handleAddKoordinator = async (nama: string, nip: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/petugas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nama, nip, tipe: 'KOORDINATOR_UKUR' })
      })
      if (!response.ok) throw new Error('Failed to add petugas')
      fetchPetugasData()
      setShowAddKoordinator(false)
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleAddPetugasUkur = async (nama: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/petugas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nama, tipe: 'PETUGAS_UKUR' })
      })
      if (!response.ok) throw new Error('Failed to add petugas')
      fetchPetugasData()
      setShowAddPetugasUkur(false)
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleAddPetugasPemetaan = async (nama: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/petugas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nama, tipe: 'PETUGAS_PEMETAAN' })
      })
      if (!response.ok) throw new Error('Failed to add petugas')
      fetchPetugasData()
      setShowAddPetugasPemetaan(false)
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleDeleteKoordinator = (index: number) => {
    const newList = [...koordinatorUkurList]
    newList.splice(index, 1)
    setKoordinatorUkurList(newList)
  }

  const handleDeletePetugasUkur = (index: number) => {
    const newList = [...petugasUkurList]
    newList.splice(index, 1)
    setPetugasUkurList(newList)
  }

  const handleDeletePetugasPemetaan = (index: number) => {
    const newList = [...petugasPemetaanList]
    newList.splice(index, 1)
    setPetugasPemetaanList(newList)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.noBerkas.trim()) {
      alert('No. Berkas harus diisi')
      return
    }
    if (!formData.namaPemohon.trim()) {
      alert('Nama Pemohon harus diisi')
      return
    }
    if (!formData.jenisPermohonan) {
      alert('Jenis Permohonan harus dipilih')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Sesi berakhir. Silakan login kembali.')
        setIsSubmitting(false)
        return
      }

      const payload = {
        noBerkas: formData.noBerkas,
        di302: formData.di302 || null,
        tanggal302: formData.tanggal302 || null,
        namaPemohon: formData.namaPemohon,
        jenisPermohonan: formData.jenisPermohonan,
        statusTanah: formData.statusTanah || null,
        keadaanTanah: formData.keadaanTanah || null,
        kecamatan: formData.kecamatan || null,
        desa: formData.desa || null,
        luas: formData.luas || null,
        luas302: formData.luas302 || null,
        luasSU: formData.luasSU || null,
        no305: formData.no305 || null,
        nib: formData.nib || null,
        notaris: formData.notaris || null,
        biayaUkur: formData.biayaUkur ? parseFloat(formData.biayaUkur) : null,
        tanggalBerkas: formData.tanggalBerkas || new Date().toISOString(),
        keterangan: formData.keterangan || null,
        koordinatorUkur: formData.koordinatorUkur || null,
        nip: formData.nip || null,
        suratTugasAn: formData.suratTugasAn || null,
        petugasUkur: formData.petugasUkur || null,
        noGu: formData.noGu || null,
        noStpPersiapuanUkur: formData.noStpPersiapuanUkur || null,
        tanggalStpPersiapuan: formData.tanggalStpPersiapuan || null,
        noStp: formData.noStp || null,
        tanggalStp: formData.tanggalStp || null,
        posisiBerkasUkur: formData.posisiBerkasUkur || null,
        petugasPemetaan: formData.petugasPemetaan || null,
        posisiBerkasMetaan: formData.posisiBerkasMetaan || null,
        keteranganPemetaan: formData.keteranganPemetaan || null,
      }

      const response = await fetch(`/api/berkas/${berkas.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Gagal menyimpan berkas: ${error.error || 'Kesalahan tidak diketahui'}`)
        setIsSubmitting(false)
        return
      }

      alert('Berkas berhasil diperbarui!')
      setIsSubmitting(false)
      
      // Redirect ke halaman detail berkas
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/berkas/${berkas.id}`)
    } catch (error) {
      alert('Terjadi kesalahan saat menyimpan berkas: ' + (error instanceof Error ? error.message : String(error)))
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">Akses ditolak</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Berkas</h1>
          <p className="text-slate-600">No. Berkas: {berkas.noBerkas}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* RBAC Info */}
        {user && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="text-sm text-slate-700">
                  <strong>User: </strong>{user.name} | <strong>Role:</strong> {user.role}
                </div>
                <div className="text-sm text-slate-600">
                  <strong>Section yang dapat diedit:</strong>
                  <div className="mt-1 space-y-1">
                    {!canEditSection(user.role, 'DATA_BERKAS') && canEditSection(user.role, 'DATA_UKUR') && canEditSection(user.role, 'DATA_PEMETAAN') && (
                      <div className="text-yellow-700 bg-yellow-50 p-2 rounded text-xs">
                        ⚠ Anda hanya dapat mengedit section DATA UKUR dan DATA PEMETAAN
                      </div>
                    )}
                    {canEditSection(user.role, 'DATA_BERKAS') && canEditSection(user.role, 'DATA_UKUR') && canEditSection(user.role, 'DATA_PEMETAAN') && (
                      <div className="text-green-700 text-xs">✓ Anda dapat mengedit SEMUA section</div>
                    )}
                    {canEditSection(user.role, 'DATA_BERKAS') && !canEditSection(user.role, 'DATA_UKUR') && !canEditSection(user.role, 'DATA_PEMETAAN') && (
                      <div className="text-green-700 text-xs">✓ Anda dapat mengedit section DATA BERKAS saja</div>
                    )}
                    {!canEditSection(user.role, 'DATA_BERKAS') && canEditSection(user.role, 'DATA_UKUR') && !canEditSection(user.role, 'DATA_PEMETAAN') && (
                      <div className="text-green-700 text-xs">✓ Anda dapat mengedit section DATA UKUR saja</div>
                    )}
                    {!canEditSection(user.role, 'DATA_BERKAS') && !canEditSection(user.role, 'DATA_UKUR') && canEditSection(user.role, 'DATA_PEMETAAN') && (
                      <div className="text-green-700 text-xs">✓ Anda dapat mengedit section DATA PEMETAAN saja</div>
                    )}
                    {!canEditSection(user.role, 'DATA_BERKAS') && !canEditSection(user.role, 'DATA_UKUR') && !canEditSection(user.role, 'DATA_PEMETAAN') && (
                      <div className="text-red-700 text-xs">✗ Anda TIDAK dapat mengedit section apapun (Read-only)</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Berkas */}
        <Card className={!canEditSection(user?.role, 'DATA_BERKAS') ? 'opacity-60 bg-slate-50' : ''}>
          <CardHeader className={canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">📋 DATA BERKAS</CardTitle>
              {!canEditSection(user?.role, 'DATA_BERKAS') && (
                <span className="text-xs bg-slate-500 px-2 py-1 rounded">Read-Only</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">No. Berkas *</label>
                <input 
                  type="text" 
                  name="noBerkas" 
                  value={formData.noBerkas} 
                  onChange={handleInputChange} 
                  disabled={!canEditSection(user?.role, 'DATA_BERKAS')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">DI 302</label>
                <input 
                  type="text" 
                  name="di302" 
                  value={formData.di302} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_BERKAS')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Tanggal 302</label>
                <input 
                  type="date" 
                  name="tanggal302" 
                  value={formData.tanggal302} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_BERKAS')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Nama Pemohon *</label>
              <input 
                type="text" 
                name="namaPemohon" 
                value={formData.namaPemohon} 
                onChange={handleInputChange}
                disabled={!canEditSection(user?.role, 'DATA_BERKAS')}
                className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Jenis Permohonan</label>
                <select 
                  name="jenisPermohonan" 
                  value={formData.jenisPermohonan} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_BERKAS')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Ukur PIB</option>
                  {JENIS_PERMOHONAN.map(jenis => (<option key={jenis} value={jenis}>{jenis}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Status Tanah</label>
                <input 
                  type="text" 
                  name="statusTanah" 
                  value={formData.statusTanah} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_BERKAS')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Kecamatan</label>
                <SearchableSelect 
                  options={kecamatanOptions} 
                  value={formData.kecamatan} 
                  onChange={(value) => setFormData(prev => ({ ...prev, kecamatan: value, desa: '' }))} 
                  placeholder="Pilih kecamatan"
                  disabled={!canEditSection(user?.role, 'DATA_BERKAS')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Desa</label>
                <SearchableSelect options={desaOptions} value={formData.desa} onChange={(value) => setFormData(prev => ({ ...prev, desa: value }))} placeholder="Pilih desa" disabled={!formData.kecamatan} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Luas</label>
                <input type="text" name="luas" value={formData.luas} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Luas 302</label>
                <input type="text" name="luas302" value={formData.luas302} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">No. 305</label>
                <input type="text" name="no305" value={formData.no305} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Keadaan Tanah</label>
                <select name="keadaanTanah" value={formData.keadaanTanah} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  <option value="">Pilih keadaan tanah</option>
                  <option value="Belum Ada">Belum Ada</option>
                  <option value="Sudah Ada">Sudah Ada</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">NIB</label>
                <input type="text" name="nib" value={formData.nib} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Luas SU</label>
                <input type="text" name="luasSU" value={formData.luasSU} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Biaya Ukur</label>
                <input type="number" name="biayaUkur" value={formData.biayaUkur} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Notaris</label>
                <input type="text" name="notaris" value={formData.notaris} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Tanggal Berkas</label>
              <input type="date" name="tanggalBerkas" value={formData.tanggalBerkas} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Keterangan</label>
              <textarea name="keterangan" value={formData.keterangan} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Data Ukur */}
        <Card className={!canEditSection(user?.role, 'DATA_UKUR') ? 'opacity-60 bg-slate-50' : ''}>
          <CardHeader className={canEditSection(user?.role, 'DATA_UKUR') ? 'bg-green-600 text-white' : 'bg-slate-400 text-white'}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">📍 DATA UKUR</CardTitle>
              {!canEditSection(user?.role, 'DATA_UKUR') && (
                <span className="text-xs bg-slate-500 px-2 py-1 rounded">Read-Only</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Koordinator Ukur</label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <SearchableSelect 
                      options={koordinatorOptions} 
                      value={formData.koordinatorUkur} 
                      onChange={handleSelectKoordinator} 
                      placeholder="Pilih koordinator ukur"
                      disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => setShowAddKoordinator(true)} 
                    disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                    className={`text-white px-3 py-2 ${canEditSection(user?.role, 'DATA_UKUR') ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {koordinatorUkurList.length > 0 && (
                    <Button 
                      type="button" 
                      onClick={() => setShowManageKoordinator(true)}
                      disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                      variant="outline"
                      className={`px-4 ${!canEditSection(user?.role, 'DATA_UKUR') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      📋 {koordinatorUkurList.length}
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">NIP</label>
                <input 
                  type="text" 
                  name="nip" 
                  value={formData.nip} 
                  onChange={handleInputChange} 
                  placeholder="NIP otomatis terisi" 
                  disabled={true}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Surat Tugas A.n.</label>
                <input 
                  type="text" 
                  name="suratTugasAn" 
                  value={formData.suratTugasAn} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Petugas Ukur</label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <SearchableSelect 
                      options={petugasUkurOptions} 
                      value={formData.petugasUkur} 
                      onChange={(value) => setFormData(prev => ({ ...prev, petugasUkur: value }))} 
                      placeholder="Pilih petugas ukur"
                      disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => setShowAddPetugasUkur(true)}
                    disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                    className={`text-white px-3 py-2 ${canEditSection(user?.role, 'DATA_UKUR') ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {petugasUkurList.length > 0 && (
                    <Button 
                      type="button" 
                      onClick={() => setShowManagePetugasUkur(true)}
                      disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                      variant="outline"
                      className={`px-4 ${!canEditSection(user?.role, 'DATA_UKUR') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      📋 {petugasUkurList.length}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">No. GU</label>
                <input 
                  type="text" 
                  name="noGu" 
                  value={formData.noGu} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">No. STP Persiapan Ukur</label>
                <input 
                  type="text" 
                  name="noStpPersiapuanUkur" 
                  value={formData.noStpPersiapuanUkur} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Tanggal Persiapan Ukur</label>
                <input 
                  type="date" 
                  name="tanggalStpPersiapuan" 
                  value={formData.tanggalStpPersiapuan} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">No. STP</label>
                <input 
                  type="text" 
                  name="noStp" 
                  value={formData.noStp} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Tanggal STP</label>
                <input 
                  type="date" 
                  name="tanggalStp" 
                  value={formData.tanggalStp} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Posisi Berkas</label>
                <input 
                  type="text" 
                  name="posisiBerkasUkur" 
                  value={formData.posisiBerkasUkur} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Pemetaan */}
        <Card className={!canEditSection(user?.role, 'DATA_PEMETAAN') ? 'opacity-60 bg-slate-50' : ''}>
          <CardHeader className={canEditSection(user?.role, 'DATA_PEMETAAN') ? 'bg-purple-600 text-white' : 'bg-slate-400 text-white'}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">📍 DATA PENUGASAN PEMETAAN</CardTitle>
              {!canEditSection(user?.role, 'DATA_PEMETAAN') && (
                <span className="text-xs bg-slate-500 px-2 py-1 rounded">Read-Only</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Petugas Pemetaan</label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <SearchableSelect 
                      options={petugasPemetaanOptions} 
                      value={formData.petugasPemetaan} 
                      onChange={(value) => setFormData(prev => ({ ...prev, petugasPemetaan: value }))} 
                      placeholder="Pilih petugas pemetaan"
                      disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => setShowAddPetugasPemetaan(true)}
                    disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')}
                    className={`text-white px-3 py-2 ${canEditSection(user?.role, 'DATA_PEMETAAN') ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {petugasPemetaanList.length > 0 && (
                    <Button 
                      type="button" 
                      onClick={() => setShowManagePetugasPemetaan(true)}
                      disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')}
                      variant="outline"
                      className={`px-4 ${!canEditSection(user?.role, 'DATA_PEMETAAN') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      📋 {petugasPemetaanList.length}
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Posisi Berkas</label>
                <input 
                  type="text" 
                  name="posisiBerkasMetaan" 
                  value={formData.posisiBerkasMetaan} 
                  onChange={handleInputChange}
                  disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_PEMETAAN') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Keterangan</label>
              <textarea 
                name="keteranganPemetaan" 
                value={formData.keteranganPemetaan} 
                onChange={handleInputChange} 
                rows={3}
                disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')}
                className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_PEMETAAN') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-center gap-4 pt-6">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Batal
          </Button>
          {canEditSection(user?.role, 'DATA_BERKAS') || canEditSection(user?.role, 'DATA_UKUR') || canEditSection(user?.role, 'DATA_PEMETAAN') ? (
            <Button className="bg-blue-600 hover:bg-blue-700 px-8" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '💾 Menyimpan...' : '💾 Simpan Perubahan'}
            </Button>
          ) : (
            <Button className="bg-gray-400 px-8 cursor-not-allowed" type="button" disabled>
              ⛔ Tidak Ada Hak Edit
            </Button>
          )}
        </div>
      </form>

      <AddPetugasModal isOpen={showAddKoordinator} onClose={() => setShowAddKoordinator(false)} onSubmit={(nama, nip) => handleAddKoordinator(nama, nip || '')} title="Tambah Koordinator Ukur Baru" existingNames={existingKoordinatorNames} requireNip={true} />
      <AddPetugasModal isOpen={showAddPetugasUkur} onClose={() => setShowAddPetugasUkur(false)} onSubmit={(nama) => handleAddPetugasUkur(nama)} title="Tambah Petugas Ukur Baru" existingNames={existingPetugasUkurNames} requireNip={false} />
      <AddPetugasModal isOpen={showAddPetugasPemetaan} onClose={() => setShowAddPetugasPemetaan(false)} onSubmit={(nama) => handleAddPetugasPemetaan(nama)} title="Tambah Petugas Pemetaan Baru" existingNames={existingPetugasPemetaanNames} requireNip={false} />

      <ManagePetugasModal isOpen={showManageKoordinator} onClose={() => setShowManageKoordinator(false)} title="Kelola Koordinator Ukur" subtitle="Hapus koordinator ukur dari daftar" items={koordinatorUkurList} onDelete={(nama) => handleDeleteKoordinator(koordinatorUkurList.findIndex(k => k.nama === nama))} />
      <ManagePetugasModal isOpen={showManagePetugasUkur} onClose={() => setShowManagePetugasUkur(false)} title="Kelola Petugas Ukur" subtitle="Hapus petugas ukur dari daftar" items={petugasUkurList} onDelete={(nama) => handleDeletePetugasUkur(petugasUkurList.findIndex(p => p.nama === nama))} />
      <ManagePetugasModal isOpen={showManagePetugasPemetaan} onClose={() => setShowManagePetugasPemetaan(false)} title="Kelola Petugas Pemetaan" subtitle="Hapus petugas pemetaan dari daftar" items={petugasPemetaanList} onDelete={(nama) => handleDeletePetugasPemetaan(petugasPemetaanList.findIndex(p => p.nama === nama))} />
    </div>
  )
}
