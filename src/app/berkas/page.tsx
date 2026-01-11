import { prisma } from '@/lib/db'
import { BerkasListClient } from '@/components/berkas-list-client'
import { AppLayout } from '@/components/app-layout'
import { Berkas } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// Revalidate berkas list setiap 5 detik atau on-demand
export const revalidate = 5

async function getBerkasList(): Promise<Berkas[]> {
  try {
    return await prisma.berkas.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (error: any) {
    // Only catch connection errors during build
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
      console.warn('Database connection unavailable (likely during build), returning empty array')
      return []
    }
    // Re-throw other errors so they're not silently caught
    throw error
  }
}

async function getRiwayatList() {
  try {
    return await prisma.riwayatBerkas.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (error: any) {
    // Only catch connection errors during build
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
      console.warn('Database connection unavailable (likely during build), returning empty array')
      return []
    }
    // Re-throw other errors
    throw error
  }
}

export default async function BerkasListPage() {
  const berkas = await getBerkasList()
  const riwayat = await getRiwayatList()

  return (
    <AppLayout>
      <BerkasListClient berkasData={berkas} riwayatData={riwayat} />
    </AppLayout>
  )
}
