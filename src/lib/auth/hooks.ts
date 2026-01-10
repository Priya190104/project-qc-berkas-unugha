/**
 * React Hook untuk RBAC di Frontend
 * Digunakan untuk conditional rendering dan kontrol akses
 */

'use client'

import { useEffect, useState } from 'react'
import {
  getCurrentUser,
  checkAction,
  checkSectionEdit,
  hasAnyEditPermission,
  isAdmin,
  getRoleDisplayName,
} from '@/lib/auth'
import type { BerkasAction, BerkasSection } from '@/lib/auth/roles'

/**
 * Hook: Get current user dan permissions
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage on mount
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
      }
    }
    setIsLoading(false)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
  }
}

/**
 * Hook: Check action permission
 */
export function useCanAction(action: BerkasAction) {
  const [canPerform, setCanPerform] = useState(false)

  useEffect(() => {
    setCanPerform(checkAction(action))
  }, [action])

  return canPerform
}

/**
 * Hook: Check section edit permission
 */
export function useCanEditSection(section: BerkasSection) {
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    setCanEdit(checkSectionEdit(section))
  }, [section])

  return canEdit
}

/**
 * Hook: Check if user has any edit permission
 */
export function useCanEdit() {
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    setCanEdit(hasAnyEditPermission())
  }, [])

  return canEdit
}

/**
 * Hook: Check if user is admin
 */
export function useIsAdmin() {
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    setAdmin(isAdmin())
  }, [])

  return admin
}

/**
 * Hook: Get user role display name
 */
export function useRoleDisplay() {
  const user = getCurrentUser()
  return user ? getRoleDisplayName(user.role) : 'Guest'
}

/**
 * Wrapper component untuk protecting routes
 */
export function ProtectedContent({
  children,
  requiredAction,
}: {
  children: React.ReactNode
  requiredAction?: BerkasAction
}): React.ReactNode {
  const user = getCurrentUser()

  if (!user) {
    return null
  }

  if (requiredAction && !checkAction(requiredAction)) {
    return null
  }

  return children
}
