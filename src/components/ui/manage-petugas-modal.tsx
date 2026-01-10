'use client'

import { Button } from '@/components/ui/button'
import { Trash2, X } from 'lucide-react'

interface PetugasItem {
  nama: string
  nip?: string
  id?: string
}

interface ManagePetugasModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle: string
  items: PetugasItem[]
  onDelete: (nama: string) => void
}

export function ManagePetugasModal({
  isOpen,
  onClose,
  title,
  subtitle,
  items,
  onDelete,
}: ManagePetugasModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-slate-600 py-8">Tidak ada data</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id || item.nama}
                className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
              >
                <div className="flex-1">
                  <div className="text-base font-semibold text-slate-900">
                    {item.nama}
                  </div>
                  {item.nip && (
                    <div className="text-sm text-slate-600">
                      ({item.nip})
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDelete(item.nama)}
                  className="p-2 hover:bg-red-100 rounded transition"
                  title="Hapus"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  )
}
