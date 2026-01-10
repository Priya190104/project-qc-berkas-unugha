import { prisma } from '@/lib/db'
import { BerkasListClient } from '@/components/berkas-list-client'
import { AppLayout } from '@/components/app-layout'
import { Berkas } from '@prisma/client'

async function getBerkasList(): Promise<Berkas[]> {
  return await prisma.berkas.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

async function getRiwayatList() {
  return await prisma.riwayatBerkas.findMany({
    orderBy: { createdAt: 'desc' },
  })
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
