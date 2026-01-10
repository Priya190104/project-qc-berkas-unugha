'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { AppLayout } from '@/components/app-layout'

interface ProtectedLayoutProps {
  children: ReactNode
  requiredRole?: string[]
}

export function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Add a small delay to ensure localStorage is accessible
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const user = getCurrentUser()
      const token = localStorage.getItem('token')

      if (!user || !token) {
        router.push('/login')
        setIsLoading(false)
        return
      }

      if (requiredRole && !requiredRole.includes(user.role)) {
        router.push('/berkas')
        setIsLoading(false)
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-red-600">Access Denied</div>
      </div>
    )
  }

  return <AppLayout>{children}</AppLayout>
}
