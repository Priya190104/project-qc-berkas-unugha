'use client'

import { STATUS_LABELS } from '@/lib/constants'
import { Card } from '@/components/ui/card'

interface StatusOverviewProps {
  statusBreakdown: Record<string, number>
}

export function StatusOverview({ statusBreakdown }: StatusOverviewProps) {
  const statuses = Object.entries(statusBreakdown)
    .sort((a, b) => b[1] - a[1])

  const totalBerkas = Object.values(statusBreakdown).reduce((a, b) => a + b, 0)

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'DATA_BERKAS':
        return 'bg-blue-500'
      case 'DATA_UKUR':
        return 'bg-yellow-500'
      case 'PEMETAAN':
        return 'bg-purple-500'
      case 'KKS':
        return 'bg-indigo-500'
      case 'KASI':
        return 'bg-pink-500'
      case 'SELESAI':
        return 'bg-green-500'
      case 'REVISI':
        return 'bg-orange-500'
      case 'TUNGGAKAN':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-lg font-semibold text-slate-900">Ringkasan Status</h2>
      <div className="space-y-4">
        {statuses.map(([status, count]) => {
          const percentage = totalBerkas > 0 ? (count / totalBerkas) * 100 : 0
          const colorClass = getStatusColor(status)
          const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status

          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${colorClass}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
