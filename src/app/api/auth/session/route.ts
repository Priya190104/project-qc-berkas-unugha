/**
 * GET /api/auth/session - Get current user session
 * Verifikasi token dan return user info
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await extractUserFromRequest(request)

    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
