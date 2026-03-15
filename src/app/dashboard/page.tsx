'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session && status === 'unauthenticated') {
      router.push('/login')
    } else if (session) {
      // Redirecionar baseado na role
      switch (session.user.role) {
        case 'SUPERADMIN':
        case 'ORG_ADMIN':
          router.push('/dashboard/org')
          break
        case 'VENDEDOR':
          router.push('/dashboard/vendedor')
          break
        case 'PLAYER':
          router.push('/jogar')
          break
        default:
          router.push('/login')
      }
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">Redirecionando...</p>
      </div>
    </div>
  )
}