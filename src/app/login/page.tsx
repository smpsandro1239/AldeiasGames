'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loadingRole, setLoadingRole] = useState('')
  const router = useRouter()

  const handleQuickLogin = async (role: string) => {
    setLoadingRole(role)
    setError('')
    
    try {
      const response = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login')
        setLoadingRole('')
        return
      }

      // Login successful - redirect based on role
      if (role === 'SUPERADMIN') {
        router.push('/superadmin/dashboard')
      } else if (role === 'ORG_ADMIN') {
        router.push('/admin/dashboard')
      } else if (role === 'VENDEDOR') {
        router.push('/vendedor/dashboard')
      } else {
        router.push('/jogar')
      }
      router.refresh()
    } catch (err) {
      setError('Erro ao fazer login')
      setLoadingRole('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login')
        setIsSubmitting(false)
        return
      }

      // Login successful - redirect to admin
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError('Erro ao fazer login')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Login - Aldeias Games
          </h2>
        </div>

        {/* Quick Login Buttons */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center">Login Rápido (Teste):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('SUPERADMIN')}
              disabled={loadingRole === 'SUPERADMIN'}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
            >
              {loadingRole === 'SUPERADMIN' ? '...' : 'Super Admin'}
            </button>
            <button
              onClick={() => handleQuickLogin('ORG_ADMIN')}
              disabled={loadingRole === 'ORG_ADMIN'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {loadingRole === 'ORG_ADMIN' ? '...' : 'Admin Org'}
            </button>
            <button
              onClick={() => handleQuickLogin('VENDEDOR')}
              disabled={loadingRole === 'VENDEDOR'}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              {loadingRole === 'VENDEDOR' ? '...' : 'Vendedor'}
            </button>
            <button
              onClick={() => handleQuickLogin('PLAYER')}
              disabled={loadingRole === 'PLAYER'}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 text-sm font-medium"
            >
              {loadingRole === 'PLAYER' ? '...' : 'Jogador'}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Aguardando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
