import { NextRequest, NextResponse } from 'next/server'

export const config = {
  api: {
    responseLimit: false,
  },
}

// Disable static generation untuk API routes yang butuh database
export const dynamic = 'force-dynamic'
export const revalidate = 0
