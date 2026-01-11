'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { AddPetugasModal } from '@/components/ui/add-petugas-modal'
import { ManagePetugasModal } from '@/components/ui/manage-petugas-modal'
import { JENIS_PERMOHONAN, KECAMATAN_CILACAP, DESA_CILACAP } from '@/lib/constants'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCanAction } from '@/lib/auth/hooks'
import { AppLayout } from '@/components/app-layout'
import { getCurrentUser } from '@/lib/auth'
import { canEditSection } from '@/lib/auth/roles'

interface PetugasItem {
  id?: string
  nama: string
  nip?: string
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

function BerkasCreateContent() {
  const router = useRouter()
  const canCreate = useCanAction('create')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated with small delay to ensure localStorage is accessible
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
      
      // Fetch petugas from database
      fetchPetugasData()
    }

    const fetchPetugasData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/petugas', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        })
        if (response.ok) {
          const result = await response.json()
          const petugas = result.data || []
          
          const koordinator = petugas.filter((p: any) => p.tipe === 'KOORDINATOR_UKUR')
          const petugasUkur = petugas.filter((p: any) => p.tipe === 'PETUGAS_UKUR')
          const petugasPemetaan = petugas.filter((p: any) => p.tipe === 'PETUGAS_PEMETAAN')
          
          setKoordinatorUkurList(koordinator)
          setPetugasUkurList(petugasUkur)
          setPetugasPemetaanList(petugasPemetaan)
        }
      } catch (error) {
        console.error('Error fetching petugas:', error)
      }
    }
    
    checkAuth()
  }, [router])

  const [formData, setFormData] = useState<FormDataType>({
    noBerkas: '',
    di302: '',
    tanggal302: new Date().toISOString().split('T')[0],
    namaPemohon: '',
    jenisPermohonan: '',
    statusTanah: '',
    keadaanTanah: '',
    kecamatan: '',
    desa: '',
    luas: '',
    luas302: '',
    luasSU: '',
    no305: '',
    nib: '',
    notaris: '',
    biayaUkur: '',
    tanggalBerkas: new Date().toISOString().split('T')[0],
    keterangan: '',
    koordinatorUkur: '',
    nip: '',
    suratTugasAn: '',
    petugasUkur: '',
    noGu: '',
    noStpPersiapuanUkur: '',
    tanggalStpPersiapuan: '',
    noStp: '',
    tanggalStp: '',
    posisiBerkasUkur: '',
    petugasPemetaan: '',
    posisiBerkasMetaan: '',
    keteranganPemetaan: '',
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

  const desaOptions = formData.kecamatan ? DESA_CILACAP[formData.kecamatan] || [] : []

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'kecamatan' && value !== formData.kecamatan) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        desa: '',
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleAddKoordinator = async (nama: string, nip?: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/petugas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ nama, nip: nip || '', tipe: 'KOORDINATOR_UKUR' }),
      })
      
      if (response.ok) {
        const result = await response.json()
        setKoordinatorUkurList(prev => [...prev, result.data])
        setFormData(prev => ({
          ...prev,
          koordinatorUkur: nama,
          nip: nip || '',
        }))
      } else if (response.status === 409) {
        // Duplicate name - just use it
        setKoordinatorUkurList(prev => 
          prev.some(p => p.nama === nama) ? prev : [...prev, { nama, nip }]
        )
        setFormData(prev => ({
          ...prev,
          koordinatorUkur: nama,
          nip: nip || '',
        }))
      } else {
        console.error('Error adding petugas:', await response.text())
      }
    } catch (error) {
      console.error('Error adding petugas:', error)
    }
  }

  const handleSelectKoordinator = (nama: string) => {
    const selected = koordinatorUkurList.find(item => item.nama === nama)
    setFormData(prev => ({
      ...prev,
      koordinatorUkur: nama,
      nip: selected ? selected.nip || '' : '',
    }))
  }

  const handleAddPetugasUkur = async (nama: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/petugas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ nama, tipe: 'PETUGAS_UKUR' }),
      })
      
      if (response.ok) {
        const result = await response.json()
        setPetugasUkurList(prev => [...prev, result.data])
        setFormData(prev => ({
          ...prev,
          petugasUkur: nama,
        }))
      } else if (response.status === 409) {
        // Duplicate name - just use it
        setPetugasUkurList(prev => 
          prev.some(p => p.nama === nama) ? prev : [...prev, { nama }]
        )
        setFormData(prev => ({
          ...prev,
          petugasUkur: nama,
        }))
      } else {
        console.error('Error adding petugas:', await response.text())
      }
    } catch (error) {
      console.error('Error adding petugas:', error)
    }
  }

  const handleAddPetugasPemetaan = async (nama: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/petugas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ nama, tipe: 'PETUGAS_PEMETAAN' }),
      })
      
      if (response.ok) {
        const result = await response.json()
        setPetugasPemetaanList(prev => [...prev, result.data])
        setFormData(prev => ({
          ...prev,
          petugasPemetaan: nama,
        }))
      } else if (response.status === 409) {
        // Duplicate name - just use it
        setPetugasPemetaanList(prev => 
          prev.some(p => p.nama === nama) ? prev : [...prev, { nama }]
        )
        setFormData(prev => ({
          ...prev,
          petugasPemetaan: nama,
        }))
      } else {
        console.error('Error adding petugas:', await response.text())
      }
    } catch (error) {
      console.error('Error adding petugas:', error)
    }
  }

  const handleDeleteKoordinator = (nama: string) => {
    setKoordinatorUkurList(prev => prev.filter(item => item.nama !== nama))
    if (formData.koordinatorUkur === nama) {
      setFormData(prev => ({
        ...prev,
        koordinatorUkur: '',
        nip: '',
      }))
    }
  }

  const handleDeletePetugasUkur = (nama: string) => {
    setPetugasUkurList(prev => prev.filter(item => item.nama !== nama))
    if (formData.petugasUkur === nama) {
      setFormData(prev => ({
        ...prev,
        petugasUkur: '',
      }))
    }
  }

  const handleDeletePetugasPemetaan = (nama: string) => {
    setPetugasPemetaanList(prev => prev.filter(item => item.nama !== nama))
    if (formData.petugasPemetaan === nama) {
      setFormData(prev => ({
        ...prev,
        petugasPemetaan: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
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

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Sesi berakhir. Silakan login kembali.')
        return
      }

      // Define allowed fields per role
      const allowedFieldsByRole: Record<string, string[]> = {
        ADMIN: [
          'noBerkas', 'di302', 'tanggal302', 'namaPemohon', 'jenisPermohonan',
          'statusTanah', 'keadaanTanah', 'kecamatan', 'desa', 'luas', 'luas302',
          'luasSU', 'no305', 'nib', 'notaris', 'biayaUkur', 'tanggalBerkas',
          'keterangan', 'koordinatorUkur', 'nip', 'suratTugasAn', 'petugasUkur',
          'noGu', 'noStpPersiapuanUkur', 'tanggalStpPersiapuan', 'noStp',
          'tanggalStp', 'posisiBerkasUkur', 'petugasPemetaan', 'posisiBerkasMetaan',
          'keteranganPemetaan'
        ],
        DATA_BERKAS: [
          'noBerkas', 'di302', 'tanggal302', 'namaPemohon', 'jenisPermohonan',
          'statusTanah', 'keadaanTanah', 'kecamatan', 'desa', 'luas', 'luas302',
          'luasSU', 'no305', 'nib', 'notaris', 'biayaUkur', 'tanggalBerkas',
          'keterangan'
        ],
        DATA_UKUR: [
          'noBerkas', 'di302', 'tanggal302', 'namaPemohon', 'jenisPermohonan',
          'statusTanah', 'keadaanTanah', 'kecamatan', 'desa', 'luas', 'luas302',
          'luasSU', 'no305', 'nib', 'notaris', 'biayaUkur', 'tanggalBerkas',
          'keterangan', 'koordinatorUkur', 'nip', 'suratTugasAn', 'petugasUkur',
          'noGu', 'noStpPersiapuanUkur', 'tanggalStpPersiapuan', 'noStp',
          'tanggalStp', 'posisiBerkasUkur'
        ],
        DATA_PEMETAAN: [
          'noBerkas', 'di302', 'tanggal302', 'namaPemohon', 'jenisPermohonan',
          'statusTanah', 'keadaanTanah', 'kecamatan', 'desa', 'luas', 'luas302',
          'luasSU', 'no305', 'nib', 'notaris', 'biayaUkur', 'tanggalBerkas',
          'keterangan', 'petugasPemetaan', 'posisiBerkasMetaan', 'keteranganPemetaan'
        ],
      }

      // Build payload with only allowed fields
      const allowedFields = allowedFieldsByRole[user?.role || 'DATA_BERKAS'] || allowedFieldsByRole.DATA_BERKAS
      const payload: Record<string, any> = {}

      if (allowedFields.includes('noBerkas')) payload.noBerkas = formData.noBerkas
      if (allowedFields.includes('di302')) payload.di302 = formData.di302 || null
      if (allowedFields.includes('tanggal302')) payload.tanggal302 = formData.tanggal302 || null
      if (allowedFields.includes('namaPemohon')) payload.namaPemohon = formData.namaPemohon
      if (allowedFields.includes('jenisPermohonan')) payload.jenisPermohonan = formData.jenisPermohonan
      if (allowedFields.includes('statusTanah')) payload.statusTanah = formData.statusTanah || null
      if (allowedFields.includes('keadaanTanah')) payload.keadaanTanah = formData.keadaanTanah || null
      if (allowedFields.includes('kecamatan')) payload.kecamatan = formData.kecamatan || null
      if (allowedFields.includes('desa')) payload.desa = formData.desa || null
      if (allowedFields.includes('luas')) payload.luas = formData.luas || null
      if (allowedFields.includes('luas302')) payload.luas302 = formData.luas302 || null
      if (allowedFields.includes('luasSU')) payload.luasSU = formData.luasSU || null
      if (allowedFields.includes('no305')) payload.no305 = formData.no305 || null
      if (allowedFields.includes('nib')) payload.nib = formData.nib || null
      if (allowedFields.includes('notaris')) payload.notaris = formData.notaris || null
      if (allowedFields.includes('biayaUkur')) payload.biayaUkur = formData.biayaUkur ? parseFloat(formData.biayaUkur) : null
      if (allowedFields.includes('tanggalBerkas')) payload.tanggalBerkas = formData.tanggalBerkas || new Date().toISOString()
      if (allowedFields.includes('keterangan')) payload.keterangan = formData.keterangan || null
      if (allowedFields.includes('koordinatorUkur')) payload.koordinatorUkur = formData.koordinatorUkur || null
      if (allowedFields.includes('nip')) payload.nip = formData.nip || null
      if (allowedFields.includes('suratTugasAn')) payload.suratTugasAn = formData.suratTugasAn || null
      if (allowedFields.includes('petugasUkur')) payload.petugasUkur = formData.petugasUkur || null
      if (allowedFields.includes('noGu')) payload.noGu = formData.noGu || null
      if (allowedFields.includes('noStpPersiapuanUkur')) payload.noStpPersiapuanUkur = formData.noStpPersiapuanUkur || null
      if (allowedFields.includes('tanggalStpPersiapuan')) payload.tanggalStpPersiapuan = formData.tanggalStpPersiapuan || null
      if (allowedFields.includes('noStp')) payload.noStp = formData.noStp || null
      if (allowedFields.includes('tanggalStp')) payload.tanggalStp = formData.tanggalStp || null
      if (allowedFields.includes('posisiBerkasUkur')) payload.posisiBerkasUkur = formData.posisiBerkasUkur || null
      if (allowedFields.includes('petugasPemetaan')) payload.petugasPemetaan = formData.petugasPemetaan || null
      if (allowedFields.includes('posisiBerkasMetaan')) payload.posisiBerkasMetaan = formData.posisiBerkasMetaan || null
      if (allowedFields.includes('keteranganPemetaan')) payload.keteranganPemetaan = formData.keteranganPemetaan || null

      console.log('Submitting berkas with payload:', payload)

      const response = await fetch('/api/berkas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response text:', errorText)
        try {
          const error = JSON.parse(errorText)
          console.error('Error response JSON:', error)
          
          // Handle field-specific errors
          if (error.field && Array.isArray(error.field) && error.field.length > 0) {
            const fieldErrors = error.field.map((f: string) => {
              if (f === 'noBerkas') return 'Nomor berkas sudah terdaftar'
              return f
            }).join(', ')
            alert(`Gagal menyimpan berkas: ${fieldErrors}`)
          } else {
            alert(`Gagal menyimpan berkas: ${error.error || 'Kesalahan tidak diketahui'}`)
          }
        } catch (e) {
          console.error('Failed to parse error response:', e)
          alert(`Gagal menyimpan berkas: ${errorText || response.statusText}`)
        }
        return
      }

      const result = await response.json()
      console.log('Berkas created successfully:', result)
      alert('Berkas berhasil disimpan!')
      router.push('/berkas')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Terjadi kesalahan saat menyimpan berkas: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const kecamatanOptions = KECAMATAN_CILACAP
  const koordinatorOptions = koordinatorUkurList.map(item => item.nama)
  const petugasUkurOptions = petugasUkurList.map(item => item.nama)
  const petugasPemetaanOptions = petugasPemetaanList.map(item => item.nama)

  const existingKoordinatorNames = koordinatorUkurList.map(item => item.nama)
  const existingPetugasUkurNames = petugasUkurList.map(item => item.nama)
  const existingPetugasPemetaanNames = petugasPemetaanList.map(item => item.nama)

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppLayout>
    )
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-red-600">Akses ditolak</div>
        </div>
      </AppLayout>
    )
  }

  // Check permission
  if (!canCreate) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-red-600">
            <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
            <p>Anda tidak memiliki izin untuk membuat berkas baru</p>
            <Link href="/berkas" className="mt-4 inline-block">
              <Button>Kembali ke Daftar Berkas</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/berkas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>

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
                    {!canEditSection(user.role, 'DATA_BERKAS') ? (
                      <div className="text-red-700 text-xs">✗ Anda TIDAK dapat membuat berkas (hanya ADMIN & DATA_BERKAS)</div>
                    ) : (
                      <>
                        {canEditSection(user.role, 'DATA_BERKAS') && canEditSection(user.role, 'DATA_UKUR') && canEditSection(user.role, 'DATA_PEMETAAN') && (
                          <div className="text-green-700 text-xs">✓ Anda dapat mengedit SEMUA section</div>
                        )}
                        {canEditSection(user.role, 'DATA_BERKAS') && !canEditSection(user.role, 'DATA_UKUR') && !canEditSection(user.role, 'DATA_PEMETAAN') && (
                          <div className="text-yellow-700 bg-yellow-50 p-2 rounded text-xs">
                            ⚠ Anda hanya dapat mengedit section DATA BERKAS. Section lain read-only
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DATA BERKAS */}
        <Card className={!canEditSection(user?.role, 'DATA_BERKAS') ? 'opacity-60 bg-slate-50' : ''}>
          <CardHeader className={canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">📋 DATA BERKAS</CardTitle>
              {!canEditSection(user?.role, 'DATA_BERKAS') && (
                <span className="text-xs bg-slate-500 px-2 py-1 rounded">Read-Only</span>
              )}
            </div>
          </CardHeader>
          <CardContent className={`pt-6 space-y-4 ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-50' : ''}`}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">No. Berkas *</label>
                <input type="text" name="noBerkas" value={formData.noBerkas} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">DI 302</label>
                <input type="text" name="di302" value={formData.di302} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Tanggal 302</label>
                <input type="date" name="tanggal302" value={formData.tanggal302} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Nama Pemohon *</label>
                <input type="text" name="namaPemohon" value={formData.namaPemohon} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Jenis Permohonan</label>
                  <select name="jenisPermohonan" value={formData.jenisPermohonan} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}>
                    {JENIS_PERMOHONAN.map(jenis => (<option key={jenis} value={jenis}>{jenis}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Status Tanah</label>
                  <input type="text" name="statusTanah" value={formData.statusTanah} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Kecamatan</label>
                  <SearchableSelect options={kecamatanOptions} value={formData.kecamatan} onChange={(value) => handleInputChange({ target: { name: 'kecamatan', value } } as any)} placeholder="Pilih kecamatan" disabled={!canEditSection(user?.role, 'DATA_BERKAS') || false} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Desa</label>
                  <SearchableSelect options={desaOptions} value={formData.desa} onChange={(value) => setFormData(prev => ({ ...prev, desa: value }))} placeholder="Pilih desa" disabled={!formData.kecamatan || !canEditSection(user?.role, 'DATA_BERKAS')} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Luas</label>
                  <input type="text" name="luas" value={formData.luas} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Luas 302</label>
                  <input type="text" name="luas302" value={formData.luas302} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">No. 305</label>
                  <input type="text" name="no305" value={formData.no305} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Keadaan Tanah</label>
                  <select name="keadaanTanah" value={formData.keadaanTanah} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}>
                    <option value="">Pilih keadaan tanah</option>
                    <option value="Pertanian">Pertanian</option>
                    <option value="Non-Pertanian">Non-Pertanian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">NIB</label>
                  <input type="text" name="nib" value={formData.nib} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Luas SU</label>
                  <input type="text" name="luasSU" value={formData.luasSU} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Biaya Ukur</label>
                  <input type="number" name="biayaUkur" value={formData.biayaUkur} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Notaris</label>
                  <input type="text" name="notaris" value={formData.notaris} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Tanggal Berkas</label>
                <input type="date" name="tanggalBerkas" value={formData.tanggalBerkas} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Keterangan</label>
                <textarea name="keterangan" value={formData.keterangan} onChange={handleInputChange} rows={3} disabled={!canEditSection(user?.role, 'DATA_BERKAS')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
              </div>
            </CardContent>
          </Card>

          {/* DATA UKUR */}
          <Card className={!canEditSection(user?.role, 'DATA_UKUR') ? 'opacity-60 bg-slate-50' : ''}>
            <CardHeader className={canEditSection(user?.role, 'DATA_UKUR') ? 'bg-green-600 text-white' : 'bg-slate-400 text-white'}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">📍 DATA UKUR</CardTitle>
                {!canEditSection(user?.role, 'DATA_UKUR') && (
                  <span className="text-xs bg-slate-500 px-2 py-1 rounded">Read-Only</span>
                )}
              </div>
            </CardHeader>
            <CardContent className={`pt-6 space-y-4 ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-50' : ''}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Koordinator Ukur</label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <SearchableSelect options={koordinatorOptions} value={formData.koordinatorUkur} onChange={handleSelectKoordinator} placeholder="Pilih koordinator ukur" disabled={!canEditSection(user?.role, 'DATA_UKUR')} />
                    </div>
                    <Button type="button" onClick={() => setShowAddKoordinator(true)} disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`text-white px-3 py-2 ${canEditSection(user?.role, 'DATA_UKUR') ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-400 cursor-not-allowed'}`}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    {koordinatorUkurList.length > 0 && (
                      <Button 
                        type="button" 
                        onClick={() => setShowManageKoordinator(true)} 
                        variant="outline"
                        disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                        className="px-4"
                      >
                        📋 {koordinatorUkurList.length}
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">NIP</label>
                  <input type="text" name="nip" value={formData.nip} onChange={handleInputChange} placeholder="NIP otomatis terisi" disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Surat Tugas A.n.</label>
                  <input type="text" name="suratTugasAn" value={formData.suratTugasAn} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Petugas Ukur</label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <SearchableSelect options={petugasUkurOptions} value={formData.petugasUkur} onChange={(value) => setFormData(prev => ({ ...prev, petugasUkur: value }))} placeholder="Pilih petugas ukur" disabled={!canEditSection(user?.role, 'DATA_UKUR')} />
                    </div>
                    <Button type="button" onClick={() => setShowAddPetugasUkur(true)} disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`text-white px-3 py-2 ${canEditSection(user?.role, 'DATA_UKUR') ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-400 cursor-not-allowed'}`}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    {petugasUkurList.length > 0 && (
                      <Button 
                        type="button" 
                        onClick={() => setShowManagePetugasUkur(true)} 
                        variant="outline"
                        disabled={!canEditSection(user?.role, 'DATA_UKUR')}
                        className="px-4"
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
                  <input type="text" name="noGu" value={formData.noGu} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">No. STP Persiapan Ukur</label>
                  <input type="text" name="noStpPersiapuanUkur" value={formData.noStpPersiapuanUkur} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Tanggal Persiapan Ukur</label>
                  <input type="date" name="tanggalStpPersiapuan" value={formData.tanggalStpPersiapuan} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">No. STP</label>
                  <input type="text" name="noStp" value={formData.noStp} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Tanggal STP</label>
                  <input type="date" name="tanggalStp" value={formData.tanggalStp} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Posisi Berkas</label>
                  <input type="text" name="posisiBerkasUkur" value={formData.posisiBerkasUkur} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_UKUR')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_UKUR') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DATA PEMETAAN */}
          <Card className={!canEditSection(user?.role, 'DATA_PEMETAAN') ? 'opacity-60 bg-slate-50' : ''}>
            <CardHeader className={canEditSection(user?.role, 'DATA_PEMETAAN') ? 'bg-purple-600 text-white' : 'bg-slate-400 text-white'}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">📍 DATA PENUGASAN PEMETAAN</CardTitle>
                {!canEditSection(user?.role, 'DATA_PEMETAAN') && (
                  <span className="text-xs bg-slate-500 px-2 py-1 rounded">Read-Only</span>
                )}
              </div>
            </CardHeader>
            <CardContent className={`pt-6 space-y-4 ${!canEditSection(user?.role, 'DATA_PEMETAAN') ? 'bg-slate-50' : ''}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Petugas Pemetaan</label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <SearchableSelect options={petugasPemetaanOptions} value={formData.petugasPemetaan} onChange={(value) => setFormData(prev => ({ ...prev, petugasPemetaan: value }))} placeholder="Pilih petugas pemetaan" disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')} />
                    </div>
                    <Button type="button" onClick={() => setShowAddPetugasPemetaan(true)} disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')} className={`text-white px-3 py-2 ${canEditSection(user?.role, 'DATA_PEMETAAN') ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-400 cursor-not-allowed'}`}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    {petugasPemetaanList.length > 0 && (
                      <Button 
                        type="button" 
                        onClick={() => setShowManagePetugasPemetaan(true)} 
                        variant="outline"
                        disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')}
                        className="px-4"
                      >
                        📋 {petugasPemetaanList.length}
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Posisi Berkas</label>
                  <input type="text" name="posisiBerkasMetaan" value={formData.posisiBerkasMetaan} onChange={handleInputChange} disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_PEMETAAN') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Keterangan</label>
                <textarea name="keteranganPemetaan" value={formData.keteranganPemetaan} onChange={handleInputChange} rows={3} disabled={!canEditSection(user?.role, 'DATA_PEMETAAN')} className={`w-full px-3 py-2 border border-slate-300 rounded-lg ${!canEditSection(user?.role, 'DATA_PEMETAAN') ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 pt-6">
            <Link href="/berkas">
              <Button variant="outline" type="button">
                Batal
              </Button>
            </Link>
            <Button 
              className={`px-8 ${!canEditSection(user?.role, 'DATA_BERKAS') ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`} 
              type="submit"
              disabled={!canEditSection(user?.role, 'DATA_BERKAS')}
              title={!canEditSection(user?.role, 'DATA_BERKAS') ? 'Hanya ADMIN dan DATA_BERKAS yang dapat membuat berkas' : ''}
            >
              💾 Simpan Berkas
            </Button>
          </div>
        </form>

        <AddPetugasModal isOpen={showAddKoordinator} onClose={() => setShowAddKoordinator(false)} onSubmit={handleAddKoordinator} title="Tambah Koordinator Ukur Baru" existingNames={existingKoordinatorNames} requireNip={true} />
        <AddPetugasModal isOpen={showAddPetugasUkur} onClose={() => setShowAddPetugasUkur(false)} onSubmit={handleAddPetugasUkur} title="Tambah Petugas Ukur Baru" existingNames={existingPetugasUkurNames} requireNip={false} />
        <AddPetugasModal isOpen={showAddPetugasPemetaan} onClose={() => setShowAddPetugasPemetaan(false)} onSubmit={handleAddPetugasPemetaan} title="Tambah Petugas Pemetaan Baru" existingNames={existingPetugasPemetaanNames} requireNip={false} />

        <ManagePetugasModal isOpen={showManageKoordinator} onClose={() => setShowManageKoordinator(false)} title="Kelola Koordinator Ukur" subtitle="Hapus koordinator ukur dari daftar" items={koordinatorUkurList} onDelete={handleDeleteKoordinator} />
        <ManagePetugasModal isOpen={showManagePetugasUkur} onClose={() => setShowManagePetugasUkur(false)} title="Kelola Petugas Ukur" subtitle="Hapus petugas ukur dari daftar" items={petugasUkurList} onDelete={handleDeletePetugasUkur} />
        <ManagePetugasModal isOpen={showManagePetugasPemetaan} onClose={() => setShowManagePetugasPemetaan(false)} title="Kelola Petugas Pemetaan" subtitle="Hapus petugas pemetaan dari daftar" items={petugasPemetaanList} onDelete={handleDeletePetugasPemetaan} />
      </div>
    </AppLayout>
  )
}

export default function BerkasCreatePage() {
  return <BerkasCreateContent />
}
