// Sessão do cliente baseada no sistema de autenticação real do projeto (JWT próprio).
// Substitui useSession() do next-auth, que nunca funcionava porque a aplicação não
// tem SessionProvider montado — era a causa do crash de prerenderização em produção.
'use client'

import { useCallback, useEffect, useState } from 'react'

export interface ClientSessionUser {
  id: string
  nome: string
  name: string // alias para compatibilidade com código existente
  email: string
  role: string
  aldeiaId?: string | null
}

export interface ClientSession {
  user: ClientSessionUser
}

/**
 * Lê o cookie `auth-token` (mesmo mecanismo usado por src/lib/auth.ts e src/proxy.ts).
 * O token é um JSON codificado em base64 definido no login/dev-login.
 */
export function readSessionFromCookie(): ClientSession | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('auth-token='))
  if (!match) return null
  try {
    const raw = decodeURIComponent(match.slice('auth-token='.length))
    const decoded = JSON.parse(atob(raw))
    if (!decoded || !decoded.email) return null
    const user: ClientSessionUser = {
      id: decoded.id,
      nome: decoded.nome ?? decoded.name ?? '',
      name: decoded.nome ?? decoded.name ?? '',
      email: decoded.email,
      role: decoded.role ?? '',
      aldeiaId: decoded.aldeiaId ?? null,
    }
    return { user }
  } catch {
    return null
  }
}

export function useClientSession(): {
  data: ClientSession | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
} {
  const [data, setData] = useState<ClientSession | null>(null)
  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading')

  useEffect(() => {
    const session = readSessionFromCookie()
    setData(session)
    setStatus(session ? 'authenticated' : 'unauthenticated')
  }, [])

  return { data, status }
}

/** Faz logout na API e redireciona para /login (substituto de signOut do next-auth). */
export async function logout(callbackUrl = '/login') {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } finally {
    window.location.href = callbackUrl
  }
}
