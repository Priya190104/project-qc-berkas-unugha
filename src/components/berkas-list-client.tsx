'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, Edit, Trash2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { STATUS_COLORS, STATUS_LABELS, formatDate } from '@/lib/constants'
import { useCanAction, useCanEditSection } from '@/lib/auth/hooks'
import { getCurrentUser } from '@/lib/auth'
import { Berkas } from '@prisma/client'

interface BerkasListClientProps {
  berkasData: Berkas[]
  riwayatData?: any[]
}

export function BerkasListClient({ berkasData, riwayatData = [] }: BerkasListClientProps) {
  const router = useRouter()
  const [berkas, setBerkas] = useState<Berkas[]>(berkasData)
  const [filteredBerkas, setFilteredBerkas] = useState<Berkas[]>(berkasData)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const canCreate = useCanAction('create')
  const canEdit = useCanAction('edit')
  const canDelete = useCanAction('delete')

  // Helper function to check if berkas is overdue (> 7 days without status change)
  const isOverdue = (berkasId: string): boolean => {
    const berkaRiwayat = riwayatData.filter((r: any) => r.berkasId === berkasId)
    if (berkaRiwayat.length === 0) return false
    
    const lastEntry = berkaRiwayat[berkaRiwayat.length - 1]
    const lastDate = new Date(lastEntry.createdAt)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysDiff >= 7
  }

  // Filter berkas berdasarkan status tab
  const filterByTab = (tab: string, data: Berkas[]): Berkas[] => {
    switch (tab) {
      case 'Semua':
        return data
      case 'Proses':
        return data.filter(b => b.statusBerkas !== 'SELESAI' && b.statusBerkas !== 'TUNGGAKAN')
      case 'Selesai':
        return data.filter(b => b.statusBerkas === 'SELESAI')
      case 'Tunggakan':
        return data.filter(b => isOverdue(b.id) && b.statusBerkas !== 'SELESAI')
      default:
        return data
    }
  }

  // Filter berkas berdasarkan search query
  const filterBySearch = (query: string, data: Berkas[]): Berkas[] => {
    if (!query.trim()) return data

    const lowercaseQuery = query.toLowerCase()
    return data.filter(b => 
      b.noBerkas?.toLowerCase().includes(lowercaseQuery) ||
      b.namaPemohon?.toLowerCase().includes(lowercaseQuery) ||
      b.kecamatan?.toLowerCase().includes(lowercaseQuery) ||
      b.desa?.toLowerCase().includes(lowercaseQuery)
    )
  }

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const user = getCurrentUser()
      const token = localStorage.getItem('token')

      if (!user || !token) {
        router.push('/login')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    setFilteredBerkas(filterByTab(activeTab, berkas))
  }, [activeTab, berkas])

  useEffect(() => {
    const tabFiltered = filterByTab(activeTab, berkas)
    const searchFiltered = filterBySearch(searchQuery, tabFiltered)
    setFilteredBerkas(searchFiltered)
  }, [searchQuery, activeTab, berkas])

  const daftarBerkas = [
    { tab: 'Semua', count: berkas.length },
    { tab: 'Proses', count: berkas.filter((b: Berkas) => b.statusBerkas !== 'SELESAI' && b.statusBerkas !== 'TUNGGAKAN').length },
    { tab: 'Selesai', count: berkas.filter((b: Berkas) => b.statusBerkas === 'SELESAI').length },
    { tab: 'Tunggakan', count: berkas.filter((b: Berkas) => isOverdue(b.id) && b.statusBerkas !== 'SELESAI').length },
  ]

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus berkas ini?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/berkas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove deleted berkas from state
        setBerkas(berkas.filter(b => b.id !== id))
        alert('Berkas berhasil dihapus')
      } else {
        alert('Gagal menghapus berkas')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Terjadi kesalahan')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Daftar Berkas</h1>
          <p className="mt-1 text-slate-600">
            Total {berkas.length} berkas tercatat
          </p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Link href="/berkas/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                + Tambah Berkas
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {daftarBerkas.map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === item.tab
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-600 border-transparent hover:border-blue-600'
            }`}
          >
            {item.tab}
            <span className="ml-2 text-slate-500">({item.count})</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Berkas, Nama Pemohon, atau Lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-slate-900 placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Hapus pencarian"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">No. Berkas</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Pemohon</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Lokasi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Tgl Masuk</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBerkas.length > 0 ? (
                filteredBerkas.map((item: Berkas) => (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.noBerkas}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.namaPemohon}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.kecamatan} / {item.desa}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.statusBerkas as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[item.statusBerkas as keyof typeof STATUS_LABELS]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(item.tanggalBerkas)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/berkas/${item.id}`}>
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Lihat Detail">
                            <Eye size={18} />
                          </button>
                        </Link>
                        {canEdit && item.statusBerkas !== 'SELESAI' && (
                          <Link href={`/berkas/${item.id}/edit`}>
                            <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Edit">
                              <Edit size={18} />
                            </button>
                          </Link>
                        )}
                        {canDelete && item.statusBerkas !== 'SELESAI' && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {searchQuery ? (
                      <>
                        Tidak ada berkas yang cocok dengan pencarian "{searchQuery}"
                        <br />
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-blue-600 hover:underline mt-2"
                        >
                          Hapus filter pencarian
                        </button>
                      </>
                    ) : (
                      `Tidak ada berkas untuk status "${activeTab}"`
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
