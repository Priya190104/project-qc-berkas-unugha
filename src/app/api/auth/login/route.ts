/**
 * POST /api/auth/login - Login endpoint
 * Returns JWT token untuk digunakan di request headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UserRole } from '@/lib/auth/roles'

// Disable static generation untuk API route ini
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Secret untuk JWT signing (GANTI DI PRODUCTION!)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

/**
 * Simple JWT signing (Gunakan library seperti jsonwebtoken di production)
 */
function signJWT(payload: any): string {
  // Simplified JWT: header.payload.signature
  // Note: Untuk production, gunakan library jsonwebtoken
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64').replace(/=/g, '')
  const payloadStr = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64').replace(/=/g, '')

  // Simplified signature
  const signature = Buffer.from(JWT_SECRET).toString('base64').substring(0, 20)

  return `${header}.${payloadStr}.${signature}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password diperlukan' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.active) {
      return NextResponse.json(
        { error: 'Akun Anda telah dinonaktifkan. Hubungi administrator.' },
        { status: 403 }
      )
    }

    // Simple password check (dalam production, gunakan bcrypt atau library sejenis)
    // Untuk testing, password = "password"
    if (password !== 'password') {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
