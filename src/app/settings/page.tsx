'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { EditUserModal } from '@/components/ui/edit-user-modal'
import { AddUserModal } from '@/components/ui/add-user-modal'
import { isAdmin } from '@/lib/auth'

interface User {
  id: string
  name: string
  email: string
  role: string
  active: boolean
}

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  ADMIN: 'Administrator',
  DATA_BERKAS: 'Operator Data Berkas',
  DATA_UKUR: 'Operator Data Ukur',
  DATA_PEMETAAN: 'Operator Data Pemetaan',
  QUALITY_CONTROL: 'Quality Control',
}

export default function SettingsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      router.push('/dashboard')
      return
    }
    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const response = await fetch('/api/petugas/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          setError('Anda tidak memiliki akses untuk melihat manajemen user')
          setUsers([])
          return
        }
        throw new Error('Gagal mengambil data user')
      }

      const data = await response.json()
      setUsers(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data user')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (formData: any) => {
    if (!editingUser) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/petugas/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Gagal mengubah user')
      }

      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? { ...u, ...formData } : u
        )
      )
      setIsEditModalOpen(false)
      setEditingUser(null)
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const handleAddUser = async (formData: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/petugas/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Gagal membuat user')
      }

      const data = await response.json()
      setUsers([...users, data.data])
      setIsAddModalOpen(false)
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/petugas/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Gagal menghapus user')
      }

      setUsers(users.filter((u) => u.id !== userId))
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus user')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pengaturan</h1>
          <p className="mt-1 text-slate-600">
            Kelola hak akses dan permission user
          </p>
        </div>

        {error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Manajemen User */}
        <Card>
          <CardHeader className="bg-slate-900 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <span>👤 Manajemen User</span>
              </CardTitle>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + Tambah User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="text-center py-8 text-slate-600">
                Memuat data user...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                          Tidak ada user
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {ROLE_DISPLAY_NAMES[user.role] || user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                user.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.active ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-1 hover:bg-slate-100 rounded"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4 text-slate-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="p-1 hover:bg-slate-100 rounded"
                                title="Hapus user"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditUserModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingUser(null)
        }}
        onSave={handleSaveEdit}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddUser}
      />
    </AppLayout>
  )
}
