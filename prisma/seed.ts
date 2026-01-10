/**
 * Prisma seed script untuk create test users dengan semua roles
 * Run: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Enum values sesuai schema.prisma
enum UserRole {
  ADMIN = 'ADMIN',
  DATA_BERKAS = 'DATA_BERKAS',
  DATA_UKUR = 'DATA_UKUR',
  DATA_PEMETAAN = 'DATA_PEMETAAN',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
}

async function main() {
  console.log('🌱 Seeding database with test users...')

  // Test users untuk setiap role
  // Password: "password" (simple untuk testing)
  const testUsers = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'password',
      role: UserRole.ADMIN,
    },
    {
      email: 'berkas@example.com',
      name: 'Data Berkas Officer',
      password: 'password',
      role: UserRole.DATA_BERKAS,
    },
    {
      email: 'ukur@example.com',
      name: 'Data Ukur Officer',
      password: 'password',
      role: UserRole.DATA_UKUR,
    },
    {
      email: 'pemetaan@example.com',
      name: 'Data Pemetaan Officer',
      password: 'password',
      role: UserRole.DATA_PEMETAAN,
    },
    {
      email: 'qc@example.com',
      name: 'Quality Control Officer',
      password: 'password',
      role: UserRole.QUALITY_CONTROL,
    },
  ]

  for (const user of testUsers) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (existingUser) {
        console.log(`  ✓ User ${user.email} already exists`)
      } else {
        await prisma.user.create({
          data: user,
        })
        console.log(`  ✓ Created user: ${user.email} (${user.role})`)
      }
    } catch (error) {
      console.error(`  ✗ Error creating user ${user.email}:`, error)
    }
  }

  console.log('\n✅ Seeding complete!')
  console.log('\nTest Users:')
  testUsers.forEach((user) => {
    console.log(`  - ${user.email} / password (Role: ${user.role})`)
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
