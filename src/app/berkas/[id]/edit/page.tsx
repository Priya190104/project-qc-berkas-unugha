import { prisma } from '@/lib/db'
import { AppLayout } from '@/components/app-layout'
import { BerkasEditForm } from '@/components/berkas-edit-form'
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

export default async function BerkasEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const berkas = await getBerkasById(id)

  return (
    <AppLayout>
      <BerkasEditForm berkas={berkas} />
    </AppLayout>
  )
}
