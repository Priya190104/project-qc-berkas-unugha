/**
 * Barrel export untuk semua auth utilities
 * Memudahkan import dari luar
 */

// Roles & Permissions
export {
  UserRole,
  ROLE_PERMISSIONS,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  canPerformAction,
  canEditSection,
  getEditableSections,
  hasEditPermission,
} from './roles'

export type { BerkasSection, BerkasAction, RolePermissions } from './roles'

// Middleware
export {
  extractUserFromRequest,
  requireAuth,
  requireAction,
  requireSectionEdit,
  requireRole,
} from './middleware'

export type { AuthContext } from './middleware'

// Frontend utilities
export {
  setCurrentUser,
  getCurrentUser,
  isAuthenticated,
  checkAction,
  checkSectionEdit,
  hasAnyEditPermission,
  getRoleDisplayName,
  getCurrentRoleDisplayName,
  hasRole,
  isAdmin,
} from './index'

export type { CurrentUser } from './index'

// Hooks
export {
  useAuth,
  useCanAction,
  useCanEditSection,
  useCanEdit,
  useIsAdmin,
  useRoleDisplay,
  ProtectedContent,
} from './hooks'

// Context
export { AuthProvider, useAuthContext } from './context'

export type { AuthContextType } from './context'

// Test utilities
export {
  testAllRolesActions,
  testAllRolesSections,
  printPermissionMatrix,
  exportPermissionsAsJSON,
  validatePermissionMatrix,
} from './test-utils'
