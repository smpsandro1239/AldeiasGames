import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { hasPermission, Role } from '@/lib/role-permissions';

// Routes accessible by each role
const ROLE_ROUTES: Record<Role, string[]> = {
  SUPER_ADMIN: ['/super-admin', '/admin', '/vendedor', '/cliente'],
  ADMIN: ['/admin', '/vendedor', '/cliente'],
  VENDEDOR: ['/vendedor', '/cliente'],
  CLIENTE: ['/cliente'],
};

// Get role from session/cookie (mock implementation)
function getUserRole(request: NextRequest): Role {
  // TODO: Implement real auth - check session cookie or JWT
  const roleCookie = request.cookies.get('user-role');
  
  if (roleCookie?.value && ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR', 'CLIENTE'].includes(roleCookie.value)) {
    return roleCookie.value as Role;
  }
  
  // Default role for development
  return 'CLIENTE';
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
  
  // Check if route is accessible for role
  const allowedRoutes = ROLE_ROUTES[userRole] || [];
  const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));
  
  if (!hasAccess) {
    // Redirect to default dashboard for role
    const redirectMap: Record<Role, string> = {
      SUPER_ADMIN: '/super-admin',
      ADMIN: '/admin',
      VENDEDOR: '/vendedor',
      CLIENTE: '/cliente',
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
