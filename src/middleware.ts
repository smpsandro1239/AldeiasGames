/**
 * middleware.ts
 * Proteção de rotas por role
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth',
  '/api/jogos/public',
  '/api/campanhas/public',
];

// Routes accessible by role
const roleRoutes: Record<string, string[]> = {
  '/dashboard': ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR', 'CLIENTE'],
  '/admin': ['SUPER_ADMIN', 'ADMIN'],
  '/super-admin': ['SUPER_ADMIN'],
  '/venda': ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR'],
  '/jogos': ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR', 'CLIENTE'],
  '/api/admin': ['SUPER_ADMIN', 'ADMIN'],
  '/api/vendas': ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR'],
  '/api/vendedor': ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Get user role from cookie or header (set by auth)
  const userRole = request.cookies.get('userRole')?.value || 
                   request.headers.get('x-user-role');
  
  // If no role, redirect to login
  if (!userRole) {
    // Allow API routes to proceed (they'll handle auth)
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        // Role not allowed - redirect to appropriate dashboard
        const redirectMap: Record<string, string> = {
          SUPER_ADMIN: '/dashboard/super-admin',
          ADMIN: '/dashboard/admin',
          VENDEDOR: '/dashboard/vendedor',
          CLIENTE: '/dashboard/cliente',
        };
        
        return NextResponse.redirect(
          new URL(redirectMap[userRole] || '/login', request.url)
        );
      }
      break;
    }
  }
  
  // Add role header for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-role', userRole);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
