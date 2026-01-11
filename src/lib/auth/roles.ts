/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines permissions for each user role in the system
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  DATA_BERKAS = 'DATA_BERKAS',
  DATA_UKUR = 'DATA_UKUR',
  DATA_PEMETAAN = 'DATA_PEMETAAN',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
}

export type BerkasSection = 'DATA_BERKAS' | 'DATA_UKUR' | 'DATA_PEMETAAN'
export type BerkasAction = 'view' | 'create' | 'edit' | 'delete' | 'move_stage' | 'print'

export interface RolePermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canMoveStage: boolean
  canPrint: boolean
  editableSections: BerkasSection[]
}

/**
 * Permission matrix untuk setiap role
 * Berdasarkan requirement:
 * - ADMIN: Akses penuh semua section
 * - DATA_BERKAS: Hanya section DATA_BERKAS
 * - DATA_UKUR: Section DATA_BERKAS + DATA_UKUR
 * - DATA_PEMETAAN: Section DATA_BERKAS + DATA_PEMETAAN
 * - QUALITY_CONTROL: View dan move stage saja
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canMoveStage: true,
    canPrint: true,
    editableSections: ['DATA_BERKAS', 'DATA_UKUR', 'DATA_PEMETAAN'],
  },
  [UserRole.DATA_BERKAS]: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canMoveStage: true,
    canPrint: true,
    editableSections: ['DATA_BERKAS'],
  },
  [UserRole.DATA_UKUR]: {
    canView: true,
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canMoveStage: true,
    canPrint: true,
    editableSections: ['DATA_BERKAS', 'DATA_UKUR'],
  },
  [UserRole.DATA_PEMETAAN]: {
    canView: true,
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canMoveStage: true,
    canPrint: true,
    editableSections: ['DATA_BERKAS', 'DATA_PEMETAAN'],
  },
  [UserRole.QUALITY_CONTROL]: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canMoveStage: true,
    canPrint: true,
    editableSections: [],
  },
}

/**
 * Utility function: Check if role can perform action
 */
export function canPerformAction(
  role: UserRole,
  action: BerkasAction
): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  
  switch (action) {
    case 'view':
      return permissions.canView
    case 'create':
      return permissions.canCreate
    case 'edit':
      return permissions.canEdit
    case 'delete':
      return permissions.canDelete
    case 'move_stage':
      return permissions.canMoveStage
    case 'print':
      return permissions.canPrint
    default:
      return false
  }
}

/**
 * Utility function: Check if role can edit specific section
 */
export function canEditSection(
  role: UserRole,
  section: BerkasSection
): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.editableSections.includes(section)
}

/**
 * Utility function: Get editable sections for a role
 */
export function getEditableSections(role: UserRole): BerkasSection[] {
  return ROLE_PERMISSIONS[role].editableSections
}

/**
 * Utility function: Check if role has any edit permissions
 */
export function hasEditPermission(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canEdit
}

/**
 * Display name untuk role (untuk UI)
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.DATA_BERKAS]: 'Operator Data Berkas',
  [UserRole.DATA_UKUR]: 'Operator Data Ukur',
  [UserRole.DATA_PEMETAAN]: 'Operator Data Pemetaan',
  [UserRole.QUALITY_CONTROL]: 'Quality Control',
}

/**
 * Deskripsi role untuk informasi
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Akses penuh ke semua fitur dan data',
  [UserRole.DATA_BERKAS]: 'Mengelola data berkas tanah',
  [UserRole.DATA_UKUR]: 'Mengelola data ukur dan pengukuran',
  [UserRole.DATA_PEMETAAN]: 'Mengelola data pemetaan',
  [UserRole.QUALITY_CONTROL]: 'Melakukan quality control dan approval',
}
