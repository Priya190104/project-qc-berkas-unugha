'use client'

import { useState } from 'react'
import { Button } from './button'
import { X } from 'lucide-react'

interface AddPetugasModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (nama: string, nip?: string) => void
  title: string
  existingNames?: string[]
  requireNip?: boolean // true untuk Koordinator Ukur, false untuk Petugas lain
}

export function AddPetugasModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  existingNames,
  requireNip = false,
}: AddPetugasModalProps) {
  const [nama, setNama] = useState('')
  const [nip, setNip] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')

    if (!nama.trim()) {
      setError('Nama wajib diisi')
      return
    }

    if (requireNip && !nip.trim()) {
      setError('NIP wajib diisi')
      return
    }

    if (requireNip && !/^\d+$/.test(nip)) {
      setError('NIP harus berisi angka saja')
      return
    }

    if (existingNames && existingNames.includes(nama)) {
      setError('Nama sudah terdaftar')
      return
    }

    onSubmit(nama, requireNip ? nip : undefined)
    setNama('')
    setNip('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Masukkan {requireNip ? 'nama dan NIP ' : 'nama '}{title.toLowerCase()}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Nama
            </label>
            <input
              type="text"
              placeholder="Contoh: John Doe"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {requireNip && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                NIP
              </label>
              <input
                type="text"
                placeholder="Contoh: 198001012005011001"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Tambah
          </Button>
        </div>
      </div>
    </div>
  )
}
