import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export function middleware(request: NextRequest) {
  // Apenas aplicar rate limit às rotas de API
  if (request.nextUrl.pathname.startsWith('/api')) {
    const identifier = getClientIdentifier(request as any);

    // Determinar endpoint para regras específicas
    let endpoint = 'api/default';
    if (request.nextUrl.pathname.includes('/auth/login')) endpoint = 'auth/login';
    if (request.nextUrl.pathname.includes('/auth/register')) endpoint = 'auth/register';
    if (request.nextUrl.pathname.includes('/backup')) endpoint = 'api/heavy';
    if (request.nextUrl.pathname.includes('/export')) endpoint = 'api/heavy';

    const { allowed, remaining, resetTime } = checkRateLimit(identifier, endpoint);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Demasiados pedidos. Por favor, tente mais tarde.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': 'Regra dependente',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString()
          }
        }
      );
    }

    // Adicionar headers de rate limit à resposta bem-sucedida
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toString());
    return response;
  }

  return NextResponse.next();
}

// Configurar as rotas onde o middleware deve correr
export const config = {
  matcher: '/api/:path*',
};
