/**
 * POST /api/auth/logout - Logout endpoint
 * Client-side handling: remove token dari localStorage/cookies
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Server tidak perlu tracking token, cukup return success
    // Client akan menghapus token dari localStorage/cookies
    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
