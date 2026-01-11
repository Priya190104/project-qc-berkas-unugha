/**
 * GET /api/petugas/users - Get all users
 * POST /api/petugas/users - Create new user
 * Only ADMIN can access
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { UserRole } from '@/lib/auth/roles'

export async function GET(request: NextRequest) {
  try {
    const user = await extractUserFromRequest(request)
    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Only ADMIN can access user list
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Only ADMIN can access user list' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await extractUserFromRequest(request)
    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Only ADMIN can create users
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Only ADMIN can create users' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, role, active } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = Object.values(UserRole)
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production, should be hashed with bcrypt
        role,
        active: active !== undefined ? active : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    })

    // Revalidate settings page
    revalidatePath('/settings')

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: 'User created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
