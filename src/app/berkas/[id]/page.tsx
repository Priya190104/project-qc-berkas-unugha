import { prisma } from '@/lib/db'
import { AppLayout } from '@/components/app-layout'
import { BerkasDetail } from '@/components/berkas-detail'
import { notFound } from 'next/navigation'

async function getBerkasById(id: string) {
  const berkas = await prisma.berkas.findUnique({
    where: { id },
  })
  
  if (!berkas) {
    notFound()
  }
  
  return berkas
}

async function getRiwayatByBerkasId(berkasId: string) {
  return await prisma.riwayatBerkas.findMany({
    where: { berkasId },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function BerkasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const berkas = await getBerkasById(id)
  const riwayat = await getRiwayatByBerkasId(id)

  return (
    <AppLayout>
      <BerkasDetail berkas={berkas} riwayat={riwayat} />
    </AppLayout>
  )
}
