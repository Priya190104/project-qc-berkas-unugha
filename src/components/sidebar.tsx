'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, FileText, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { setCurrentUser, isAdmin } from '@/lib/auth'
import { useEffect, useState } from 'react'

const baseMenuItems = [
  {
    href: '/dashboard',
    icon: LayoutGrid,
    label: 'Dashboard',
  },
  {
    href: '/berkas',
    icon: FileText,
    label: 'Daftar Berkas',
  },
]

const adminMenuItems = [
  {
    href: '/settings',
    icon: Settings,
    label: 'Pengaturan',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  useEffect(() => {
    setUserIsAdmin(isAdmin())
  }, [])

  const menuItems = userIsAdmin ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Clear local storage
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    
    // Clear in-memory state
    setCurrentUser(null)

    // Redirect to login
    router.push('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            QC
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">QC Berkas</h1>
            <p className="text-xs text-slate-500">Sistem Tracking</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-200'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t px-3 py-4">
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-200 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white">
            PA
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-semibold text-slate-900">Priya Ardhana</p>
            <p className="text-xs text-slate-600">Admin</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors">
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}
