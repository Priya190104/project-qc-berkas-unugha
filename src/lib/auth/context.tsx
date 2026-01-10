/**
 * Auth Context untuk menyimpan current user di React
 * Memudahkan akses user info dari component manapun
 */

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { setCurrentUser } from '@/lib/auth'
import type { CurrentUser } from '@/lib/auth'

export interface AuthContextType {
  user: CurrentUser | null
  loading: boolean
  login: (user: CurrentUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore user dari localStorage saat aplikasi mount
    // Ini memastikan user tetap login saat halaman di-refresh
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('currentUser')
    
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setCurrentUser(userData)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        // Clear invalid data
        localStorage.removeItem('currentUser')
        localStorage.removeItem('token')
      }
    } else {
      // Clear in-memory state if no token/user
      setCurrentUser(null)
    }
    
    setLoading(false)
  }, [])

  const login = (userData: CurrentUser) => {
    setUser(userData)
    setCurrentUser(userData)
  }

  const logout = () => {
    setUser(null)
    setCurrentUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
