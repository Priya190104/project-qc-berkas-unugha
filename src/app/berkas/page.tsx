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
  } catch (error) {
    console.error('Error fetching berkas list:', error)
    // Return empty array if database is unavailable (e.g., during build)
    return []
  }
}

async function getRiwayatList() {
  try {
    return await prisma.riwayatBerkas.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching riwayat list:', error)
    // Return empty array if database is unavailable
    return []
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
