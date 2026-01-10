/**
 * Testing & Development Utils untuk RBAC
 * Helper untuk test setiap role dan permission
 */

import { UserRole, canPerformAction, canEditSection, ROLE_PERMISSIONS } from './roles'

/**
 * Test all roles dengan all actions
 */
export function testAllRolesActions() {
  const actions = ['view', 'create', 'edit', 'delete', 'move_stage', 'print'] as const
  const results: Record<string, Record<string, boolean>> = {}

  for (const role of Object.values(UserRole)) {
    results[role] = {}
    for (const action of actions) {
      results[role][action] = canPerformAction(role as UserRole, action as any)
    }
  }

  return results
}

/**
 * Test semua roles dengan all sections
 */
export function testAllRolesSections() {
  const sections = ['DATA_BERKAS', 'DATA_UKUR', 'DATA_PEMETAAN'] as const
  const results: Record<string, Record<string, boolean>> = {}

  for (const role of Object.values(UserRole)) {
    results[role] = {}
    for (const section of sections) {
      results[role][section] = canEditSection(role as UserRole, section)
    }
  }

  return results
}

/**
 * Print permission matrix untuk console
 */
export function printPermissionMatrix() {
  console.log('\n=== ROLE PERMISSIONS MATRIX ===\n')

  const actions = ['view', 'create', 'edit', 'delete', 'move_stage', 'print'] as const
  
  // Header
  const header = ['ROLE', ...actions].join(' | ')
  console.log(header)
  console.log('-'.repeat(header.length))

  // Rows
  for (const role of Object.values(UserRole)) {
    const row: string[] = [role]
    for (const action of actions) {
      const canDo = canPerformAction(role as UserRole, action as any)
      row.push(canDo ? '✅' : '❌')
    }
    console.log(row.join(' | '))
  }

  console.log('\n=== SECTION EDIT PERMISSIONS ===\n')

  const sections = ['DATA_BERKAS', 'DATA_UKUR', 'DATA_PEMETAAN']
  
  // Header
  const sectionHeader = ['ROLE', ...sections].join(' | ')
  console.log(sectionHeader)
  console.log('-'.repeat(sectionHeader.length))

  // Rows
  for (const role of Object.values(UserRole)) {
    const row: string[] = [role]
    for (const section of sections) {
      const canEdit = canEditSection(role as UserRole, section as any)
      row.push(canEdit ? '✅' : '❌')
    }
    console.log(row.join(' | '))
  }

  console.log('\n')
}

/**
 * Export permission matrix sebagai JSON
 */
export function exportPermissionsAsJSON() {
  return {
    timestamp: new Date().toISOString(),
    actions: testAllRolesActions(),
    sections: testAllRolesSections(),
    detailed: ROLE_PERMISSIONS,
  }
}

/**
 * Validate permission matrix sesuai requirement
 */
export function validatePermissionMatrix(): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // ADMIN should have all permissions
  const adminPerms = ROLE_PERMISSIONS[UserRole.ADMIN]
  if (!adminPerms.canView) errors.push('ADMIN harus bisa view')
  if (!adminPerms.canCreate) errors.push('ADMIN harus bisa create')
  if (!adminPerms.canEdit) errors.push('ADMIN harus bisa edit')
  if (!adminPerms.canDelete) errors.push('ADMIN harus bisa delete')
  if (!adminPerms.canMoveStage) errors.push('ADMIN harus bisa move_stage')
  if (!adminPerms.canPrint) errors.push('ADMIN harus bisa print')
  if (adminPerms.editableSections.length !== 3)
    errors.push('ADMIN harus bisa edit 3 sections')

  // DATA_BERKAS should have specific permissions
  const dataBerkasPerms = ROLE_PERMISSIONS[UserRole.DATA_BERKAS]
  if (!dataBerkasPerms.canView) errors.push('DATA_BERKAS harus bisa view')
  if (!dataBerkasPerms.canCreate) errors.push('DATA_BERKAS harus bisa create')
  if (!dataBerkasPerms.canEdit) errors.push('DATA_BERKAS harus bisa edit')
  if (dataBerkasPerms.canDelete) errors.push('DATA_BERKAS TIDAK boleh delete')
  if (!dataBerkasPerms.canMoveStage) errors.push('DATA_BERKAS harus bisa move_stage')
  if (!dataBerkasPerms.canPrint) errors.push('DATA_BERKAS harus bisa print')
  if (!dataBerkasPerms.editableSections.includes('DATA_BERKAS'))
    errors.push('DATA_BERKAS harus bisa edit DATA_BERKAS section')

  // DATA_UKUR should have specific permissions
  const dataUkurPerms = ROLE_PERMISSIONS[UserRole.DATA_UKUR]
  if (!dataUkurPerms.canView) errors.push('DATA_UKUR harus bisa view')
  if (dataUkurPerms.canCreate) errors.push('DATA_UKUR TIDAK boleh create')
  if (!dataUkurPerms.canEdit) errors.push('DATA_UKUR harus bisa edit')
  if (dataUkurPerms.canDelete) errors.push('DATA_UKUR TIDAK boleh delete')
  if (!dataUkurPerms.editableSections.includes('DATA_UKUR'))
    errors.push('DATA_UKUR harus bisa edit DATA_UKUR section')

  // DATA_PEMETAAN should have specific permissions
  const dataPemetaanPerms = ROLE_PERMISSIONS[UserRole.DATA_PEMETAAN]
  if (!dataPemetaanPerms.canView) errors.push('DATA_PEMETAAN harus bisa view')
  if (dataPemetaanPerms.canCreate) errors.push('DATA_PEMETAAN TIDAK boleh create')
  if (!dataPemetaanPerms.canEdit) errors.push('DATA_PEMETAAN harus bisa edit')
  if (dataPemetaanPerms.canDelete) errors.push('DATA_PEMETAAN TIDAK boleh delete')
  if (!dataPemetaanPerms.editableSections.includes('DATA_PEMETAAN'))
    errors.push('DATA_PEMETAAN harus bisa edit DATA_PEMETAAN section')

  // QUALITY_CONTROL should only view and move stage
  const qcPerms = ROLE_PERMISSIONS[UserRole.QUALITY_CONTROL]
  if (!qcPerms.canView) errors.push('QUALITY_CONTROL harus bisa view')
  if (qcPerms.canCreate) errors.push('QUALITY_CONTROL TIDAK boleh create')
  if (qcPerms.canEdit) errors.push('QUALITY_CONTROL TIDAK boleh edit')
  if (qcPerms.canDelete) errors.push('QUALITY_CONTROL TIDAK boleh delete')
  if (!qcPerms.canMoveStage) errors.push('QUALITY_CONTROL harus bisa move_stage')
  if (!qcPerms.canPrint) errors.push('QUALITY_CONTROL harus bisa print')

  return {
    valid: errors.length === 0,
    errors,
  }
}
