/**
 * RBAC Testing Examples
 * Gunakan untuk test sebelum production
 * 
 * Jalankan di console atau buat test file
 */

// Example 1: Test permission matrix validation
import { validatePermissionMatrix, printPermissionMatrix } from '@/lib/auth/test-utils'

console.log('=== VALIDATING PERMISSION MATRIX ===')
const validation = validatePermissionMatrix()
console.log('Valid:', validation.valid)
if (!validation.valid) {
  console.error('Errors:', validation.errors)
}
printPermissionMatrix()

// Example 2: Test backend middleware dengan berbagai role

// Simulating API request dengan ADMIN role
const adminRequest = {
  headers: {
    'Authorization': 'Bearer user1:admin@berkas.gov:ADMIN',
  },
}

// Simulating API request dengan DATA_BERKAS role
const dataBerkasRequest = {
  headers: {
    'Authorization': 'Bearer user2:berkas@berkas.gov:DATA_BERKAS',
  },
}

// Simulating API request dengan QUALITY_CONTROL role
const qcRequest = {
  headers: {
    'Authorization': 'Bearer user3:qc@berkas.gov:QUALITY_CONTROL',
  },
}

console.log('\n=== SIMULATED API REQUESTS ===')
console.log('Admin Request:', adminRequest)
console.log('Data Berkas Request:', dataBerkasRequest)
console.log('QC Request:', qcRequest)

// Example 3: Test edit section restrictions

import { canEditSection, UserRole } from '@/lib/auth/roles'

const testCases = [
  { role: UserRole.ADMIN, section: 'DATA_BERKAS' as const, expected: true },
  { role: UserRole.DATA_BERKAS, section: 'DATA_BERKAS' as const, expected: true },
  { role: UserRole.DATA_BERKAS, section: 'DATA_UKUR' as const, expected: false },
  { role: UserRole.DATA_UKUR, section: 'DATA_UKUR' as const, expected: true },
  { role: UserRole.DATA_UKUR, section: 'DATA_BERKAS' as const, expected: false },
  { role: UserRole.QUALITY_CONTROL, section: 'DATA_BERKAS' as const, expected: false },
]

console.log('\n=== SECTION EDIT RESTRICTION TESTS ===')
testCases.forEach((test) => {
  const actual = canEditSection(test.role, test.section)
  const status = actual === test.expected ? '✅' : '❌'
  console.log(
    `${status} ${test.role} edit ${test.section}: ${actual} (expected: ${test.expected})`
  )
})

// Example 4: Test API call flow (untuk development)

async function testAPICall(
  endpoint: string,
  method: string,
  role: UserRole,
  userId: string,
  email: string
) {
  const headers = {
    'Authorization': `Bearer ${userId}:${email}:${role}`,
    'Content-Type': 'application/json',
  }

  console.log(`\nTesting ${method} ${endpoint} dengan role ${role}`)
  console.log('Headers:', headers)

  // Simulate API call - actual implementation tergantung auth system
  // const response = await fetch(endpoint, { method, headers })
  // console.log('Response status:', response.status)
  // console.log('Response:', await response.json())
}

// Example 5: Simulate role-based UI rendering

import { useCanAction, useCanEditSection } from '@/lib/auth/hooks'

/**
 * Example component dengan RBAC
 */
function BerkasDetailExample() {
  // Note: Hanya untuk ilustrasi, actual hook perlu proper setup
  // const canCreate = useCanAction('create')
  // const canEdit = useCanAction('edit')
  // const canDelete = useCanAction('delete')
  // const canEditDataBerkas = useCanEditSection('DATA_BERKAS')

  // return (
  //   <div>
  //     {canCreate && <button>Tambah Berkas</button>}
  //     {canEditDataBerkas && <input placeholder="Edit Data Berkas" />}
  //     {canDelete && <button>Hapus Berkas</button>}
  //   </div>
  // )

  console.log('See implementation in actual components')
}

console.log('\n✅ RBAC Testing Examples Complete')
