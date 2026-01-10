/**
 * RBAC Middleware untuk Backend API
 * Validasi role dan permissions pada setiap endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { UserRole, canPerformAction, canEditSection, BerkasAction, BerkasSection } from './roles'

/**
 * Interface untuk auth context
 */
export interface AuthContext {
  userId: string
  email: string
  name: string
  role: UserRole
  isAuthenticated: boolean
}

/**
 * Helper: Extract user info dari request (dari session/token)
 * Note: Implementasi sebenarnya tergantung auth system yang digunakan
 * Saat ini placeholder yang perlu disesuaikan dengan auth system
 */
export async function extractUserFromRequest(
  request: NextRequest
): Promise<AuthContext | null> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return null
    }

    // Parse JWT token dari Authorization header
    // Format: Authorization: Bearer {token}
    const tokenMatch = authHeader.match(/Bearer\s+(.+)/)
    if (!tokenMatch) {
      return null
    }

    const token = tokenMatch[1]
    
    // Parse JWT payload (simplified - tidak verify signature)
    // Format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    try {
      // Decode payload dari base64
      const payloadStr = parts[1]
      // Add padding if needed
      const padding = 4 - (payloadStr.length % 4)
      const paddedPayload = padding < 4 ? payloadStr + '='.repeat(padding) : payloadStr
      
      const payload = JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf-8'))
      
      const { userId, email, name, role } = payload
      
      if (!userId || !email || !role) {
        return null
      }

      if (!Object.values(UserRole).includes(role)) {
        return null
      }

      return {
        userId,
        email,
        name,
        role,
        isAuthenticated: true,
      }
    } catch (parseError) {
      console.error('Error parsing JWT payload:', parseError)
      return null
    }
  } catch (error) {
    console.error('Error extracting user from request:', error)
    return null
  }
}

/**
 * Middleware: Validasi authentication
 */
export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    const user = await extractUserFromRequest(request)

    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Attach user ke request context
    ;(request as any).user = user

    return handler(request, user)
  }
}

/**
 * Middleware: Validasi action permission
 */
export function requireAction(action: BerkasAction) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const user = await extractUserFromRequest(request)

      if (!user || !user.isAuthenticated) {
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required' },
          { status: 401 }
        )
      }

      if (!canPerformAction(user.role, action)) {
        return NextResponse.json(
          {
            error: `Forbidden: Your role "${user.role}" cannot perform "${action}" action`,
            required_role: user.role,
            attempted_action: action,
          },
          { status: 403 }
        )
      }

      ;(request as any).user = user
      return handler(request, user)
    }
  }
}

/**
 * Middleware: Validasi section edit permission
 */
export function requireSectionEdit(section: BerkasSection) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const user = await extractUserFromRequest(request)

      if (!user || !user.isAuthenticated) {
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required' },
          { status: 401 }
        )
      }

      if (!canEditSection(user.role, section)) {
        return NextResponse.json(
          {
            error: `Forbidden: Your role "${user.role}" cannot edit section "${section}"`,
            required_role: user.role,
            requested_section: section,
            editable_sections: user.role === 'ADMIN' ? ['DATA_BERKAS', 'DATA_UKUR', 'DATA_PEMETAAN'] : [],
          },
          { status: 403 }
        )
      }

      ;(request as any).user = user
      return handler(request, user)
    }
  }
}

/**
 * Middleware: Validasi role spesifik
 */
export function requireRole(...roles: UserRole[]) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const user = await extractUserFromRequest(request)

      if (!user || !user.isAuthenticated) {
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required' },
          { status: 401 }
        )
      }

      if (!roles.includes(user.role)) {
        return NextResponse.json(
          {
            error: `Forbidden: This endpoint requires one of these roles: ${roles.join(', ')}`,
            current_role: user.role,
            required_roles: roles,
          },
          { status: 403 }
        )
      }

      ;(request as any).user = user
      return handler(request, user)
    }
  }
}
