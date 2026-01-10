'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Login gagal')
        return
      }

      const data = await response.json()
      const { token, user } = data

      // Simpan token dan user info
      localStorage.setItem('token', token)
      localStorage.setItem('currentUser', JSON.stringify(user))

      // Update context
      setCurrentUser(user)

      // Redirect ke dashboard page
      router.push('/dashboard')
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistem QC Berkas</h1>
          <p className="text-gray-600">BPN Cilacap</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
          >
            {loading ? 'Sedang login...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-3 font-semibold">Test Users:</p>
          <div className="space-y-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium">admin@example.com</p>
              <p className="text-gray-600">Role: ADMIN (Full Access)</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium">berkas@example.com</p>
              <p className="text-gray-600">Role: DATA_BERKAS</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium">ukur@example.com</p>
              <p className="text-gray-600">Role: DATA_UKUR</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium">pemetaan@example.com</p>
              <p className="text-gray-600">Role: DATA_PEMETAAN</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium">qc@example.com</p>
              <p className="text-gray-600">Role: QUALITY_CONTROL</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Password untuk semua user: <code className="bg-gray-100 px-1 rounded">password</code>
          </p>
        </div>
      </Card>
    </div>
  )
}
