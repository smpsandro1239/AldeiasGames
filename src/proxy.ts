import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { hasPermission, Role } from '@/lib/role-permissions';

// Routes accessible by each role
const ROLE_ROUTES: Record<Role, string[]> = {
  SUPER_ADMIN: ['/superadmin', '/admin', '/vendedor', '/cliente'],
  ADMIN: ['/admin', '/vendedor', '/cliente'],
  VENDEDOR: ['/vendedor', '/cliente'],
  CLIENTE: ['/cliente'],
};

// Get role from session/cookie (mock implementation)
function getUserRole(request: NextRequest): Role | null {
  // TODO: Implement real auth - check session cookie or JWT
  const roleCookie = request.cookies.get('user-role');

  if (roleCookie?.value && ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR', 'CLIENTE'].includes(roleCookie.value)) {
    return roleCookie.value as Role;
  }

  // Devia devolver null em vez de 'CLIENTE' para não forçar redirect sem login
  return null;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get user role
  const userRole = getUserRole(request);

  // Unauthenticated users can access root, block from protected routes
  if (!userRole) {
    if (pathname === '/' || pathname.startsWith('/auth')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if route is accessible for role
  const allowedRoutes = ROLE_ROUTES[userRole] || [];
  const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

  if (!hasAccess) {
    // Redirect to default dashboard for role
    const redirectMap: Record<Role, string> = {
      SUPER_ADMIN: '/superadmin/dashboard',
      ADMIN: '/admin/dashboard',
      VENDEDOR: '/vendedor/dashboard',
      CLIENTE: '/cliente/dashboard',
    };

    const redirectUrl = redirectMap[userRole] || '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
