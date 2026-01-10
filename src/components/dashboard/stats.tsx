'use client'

import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface DashboardStatsProps {
  totalBerkas: number
  dalamProses: number
  selesai: number
  tunggakan: number
}

export function DashboardStats({
  totalBerkas,
  dalamProses,
  selesai,
  tunggakan,
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Berkas',
      value: totalBerkas,
      icon: FileText,
      color: 'bg-slate-500',
    },
    {
      label: 'Dalam Proses',
      value: dalamProses,
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      label: 'Selesai',
      value: selesai,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Tunggakan',
      value: tunggakan,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} rounded-lg p-3 text-white`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
