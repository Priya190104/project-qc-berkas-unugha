import { prisma } from '@/lib/db'
import { AppLayout } from '@/components/app-layout'
import { DashboardWrapper } from '@/components/dashboard-wrapper'
import { DashboardStats } from '@/components/dashboard/stats'
import { StatusOverview } from '@/components/dashboard/status-overview'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Revalidate dashboard setiap 5 detik
export const revalidate = 5

async function getDashboardData() {
  try {
    const berkas = await prisma.berkas.findMany()
    
    const stats = {
      totalBerkas: berkas.length,
      dalamProses: berkas.filter((b: any) => b.statusBerkas !== 'SELESAI').length,
      selesai: berkas.filter((b: any) => b.statusBerkas === 'SELESAI').length,
      tunggakan: berkas.filter((b: any) => b.statusBerkas === 'TUNGGAKAN').length,
    }

    const statusBreakdown: Record<string, number> = {
      DATA_BERKAS: 0,
      DATA_UKUR: 0,
      PEMETAAN: 0,
      KKS: 0,
      KASI: 0,
      SELESAI: 0,
      REVISI: 0,
      TUNGGAKAN: 0,
    }

    berkas.forEach((b: any) => {
      if (b.statusBerkas in statusBreakdown) {
        statusBreakdown[b.statusBerkas]++
      }
    })

    return { stats, statusBreakdown }
  } catch (error: any) {
    // Only catch connection errors during build
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
      console.warn('Database connection unavailable (likely during build), returning empty stats')
      return {
        stats: {
          totalBerkas: 0,
          dalamProses: 0,
          selesai: 0,
          tunggakan: 0,
        },
        statusBreakdown: {
          DATA_BERKAS: 0,
          DATA_UKUR: 0,
          PEMETAAN: 0,
          KKS: 0,
          KASI: 0,
          SELESAI: 0,
          REVISI: 0,
          TUNGGAKAN: 0,
        },
      }
    }
    // Re-throw other errors so they're visible
    throw error
  }
}

export default async function DashboardPage() {
  const { stats, statusBreakdown } = await getDashboardData()

  return (
    <DashboardWrapper>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Dashboard QC Berkas
              </h1>
              <p className="mt-1 text-slate-600">
                Selamat datang, Priya Ardhana (Admin)
              </p>
            </div>
            <Link href="/berkas/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                + Tambah Berkas
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <DashboardStats
            totalBerkas={stats.totalBerkas}
            dalamProses={stats.dalamProses}
            selesai={stats.selesai}
            tunggakan={stats.tunggakan}
          />

          {/* Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StatusOverview statusBreakdown={statusBreakdown} />
            </div>
          </div>
        </div>
      </AppLayout>
    </DashboardWrapper>
  )
}
