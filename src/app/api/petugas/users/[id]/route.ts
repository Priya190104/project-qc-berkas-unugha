/**
 * GET /api/petugas/users/[id] - Get user by ID
 * PATCH /api/petugas/users/[id] - Update user (status, role)
 * DELETE /api/petugas/users/[id] - Delete user (only ADMIN)
 * Only ADMIN can access
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { extractUserFromRequest } from '@/lib/auth/middleware'
import { UserRole } from '@/lib/auth/roles'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await extractUserFromRequest(request)

    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Only ADMIN can view user details' },
        { status: 403 }
      )
    }

    const foundUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    })

    if (!foundUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: foundUser,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await extractUserFromRequest(request)

    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Only ADMIN can update users' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, role, active } = body

    // Validate role if provided
    if (role) {
      const validRoles = Object.values(UserRole)
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Check if email exists (if trying to change email)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
    }

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (password !== undefined) updateData.password = password
    if (role !== undefined) updateData.role = role
    if (active !== undefined) updateData.active = active

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await extractUserFromRequest(request)

    if (!user || !user.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Only ADMIN can delete users' },
        { status: 403 }
      )
    }

    // Prevent deleting yourself
    if (user.userId === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
