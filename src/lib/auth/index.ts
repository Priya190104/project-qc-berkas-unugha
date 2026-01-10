/**
 * Frontend RBAC Utilities
 * Helper functions untuk conditional rendering dan UI control
 */

import { UserRole, canPerformAction, canEditSection, ROLE_DISPLAY_NAMES } from './roles'
import type { BerkasAction, BerkasSection } from './roles'

/**
 * Interface untuk user yang login
 */
export interface CurrentUser {
  id: string
  email: string
  name: string
  role: UserRole
}

/**
 * Global user state (akan diisi dari context/session)
 */
let currentUser: CurrentUser | null = null

/**
 * Set current user (dipanggil saat login)
 */
export function setCurrentUser(user: CurrentUser | null) {
  currentUser = user
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('currentUser')
  }
}

/**
 * Get current user (dari in-memory state atau localStorage)
 */
export function getCurrentUser(): CurrentUser | null {
  // First try in-memory state
  if (currentUser) {
    return currentUser
  }
  
  // If not in memory, try to restore from localStorage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('currentUser')
      if (saved) {
        currentUser = JSON.parse(saved)
        return currentUser
      }
    } catch (error) {
      console.error('Error restoring user from localStorage:', error)
      localStorage.removeItem('currentUser')
    }
  }
  
  return null
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

/**
 * Check if user can perform action
 */
export function checkAction(action: BerkasAction): boolean {
  if (!getCurrentUser()) return false
  const user = getCurrentUser()
  if (!user) return false
  return canPerformAction(user.role, action)
}

/**
 * Check if user can edit specific section
 */
export function checkSectionEdit(section: BerkasSection): boolean {
  if (!currentUser) return false
  return canEditSection(currentUser.role, section)
}

/**
 * Check if user has any edit permission
 */
export function hasAnyEditPermission(): boolean {
  if (!currentUser) return false
  const editableCount = ['DATA_BERKAS', 'DATA_UKUR', 'DATA_PEMETAAN'].filter(
    (section) => canEditSection(currentUser!.role, section as BerkasSection)
  ).length
  return editableCount > 0
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role] || role
}

/**
 * Get current user role display name
 */
export function getCurrentRoleDisplayName(): string {
  if (!currentUser) return 'Guest'
  return getRoleDisplayName(currentUser.role)
}

/**
 * Check if user has specific role
 */
export function hasRole(...roles: UserRole[]): boolean {
  if (!currentUser) return false
  return roles.includes(currentUser.role)
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole(UserRole.ADMIN)
}

/**
 * Export untuk testing
 */
export { UserRole, canPerformAction, canEditSection }
