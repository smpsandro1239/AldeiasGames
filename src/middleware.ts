import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Lista de rotas públicas (não exigem autenticação)
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/api/auth', // Rotas de auth
    '/api/health',
    '/api/register'
  ]

  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })

  // Se for rota pública, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Se não estiver autenticado, redirecionar para login
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Rotas específicas por role
  const roleRoutes = {
    SUPERADMIN: ['/admin', '/admin/*'],
    ORG_ADMIN: ['/dashboard', '/dashboard/*'],
    VENDEDOR: ['/vendedor', '/vendedor/*'],
    PLAYER: ['/jogar', '/jogar/*', '/meu-perfil', '/meu-perfil/*']
  }

  // Verificar se a rota atual é protegida por role
  let roleRequired: string | null = null
  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (routes.some(route => {
      if (route.endsWith('/*')) {
        return pathname.startsWith(route.slice(0, -2))
      }
      return pathname === route
    })) {
      roleRequired = role
      break
    }
  }

  // Se a rota exigir role específica, verificar se o usuário tem essa role
  if (roleRequired && session.role !== roleRequired) {
    // Redirecionar para dashboard apropriado
    let redirectUrl = '/'
    if (session.role === 'SUPERADMIN') redirectUrl = '/admin'
    else if (session.role === 'ORG_ADMIN') redirectUrl = '/dashboard'
    else if (session.role === 'VENDEDOR') redirectUrl = '/vendedor'
    else if (session.role === 'PLAYER') redirectUrl = '/jogar'

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Verificar multi-tenancy (orgId) para rotas específicas
  if (pathname.startsWith('/org/') && session.role !== 'SUPERADMIN') {
    const orgId = pathname.split('/')[2] // /org/{orgId}/...
    
    if (orgId !== session.orgId) {
      // Tentativa de acesso a org não autorizada
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Rotas que só ORG_ADMIN pode acessar
  if (pathname.startsWith('/api/org/') && session.role !== 'SUPERADMIN' && session.role !== 'ORG_ADMIN') {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 403 }
    )
  }

  // Rotas que só VENDEDOR pode acessar
  if (pathname.startsWith('/api/vendas/') && session.role !== 'VENDEDOR' && session.role !== 'SUPERADMIN') {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 403 }
    )
  }

  // Rotas que só PLAYER pode acessar
  if (pathname.startsWith('/api/saldo/') && session.role !== 'PLAYER' && session.role !== 'SUPERADMIN') {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 403 }
    )
  }

  // Se passou por todas as verificações, permitir acesso
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}