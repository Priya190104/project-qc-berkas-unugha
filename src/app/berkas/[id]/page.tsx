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

export default async function BerkasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const berkas = await getBerkasById(id)

  return (
    <AppLayout>
      <BerkasDetail berkas={berkas} />
    </AppLayout>
  )
}
