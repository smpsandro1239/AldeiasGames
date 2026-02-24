import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export function middleware(request: NextRequest) {
  // Apenas aplicar rate limit as rotas de API
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = getClientIp(request);

    // Limites mais restritos para autenticacao
    if (
      request.nextUrl.pathname.includes('/api/auth/login') ||
      request.nextUrl.pathname.includes('/api/auth/register')
    ) {
      const result = rateLimit(`auth:${ip}`, { maxRequests: 5, windowMs: 15 * 60 * 1000 });

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Demasiadas tentativas. Tente novamente mais tarde.',
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(result.retryAfter ?? 60),
              'X-RateLimit-Limit': '5',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(result.resetAt),
            },
          }
        );
      }
    } else {
      // Rate limit geral para outras APIs
      const result = rateLimit(`api:${ip}`, { maxRequests: 100, windowMs: 60 * 1000 });

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Limite de pedidos excedido. Tente novamente em breve.',
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(result.retryAfter ?? 60),
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': String(result.remaining),
              'X-RateLimit-Reset': String(result.resetAt),
            },
          }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplicar a todas as rotas de API exceto health check
    '/api/((?!health$).*)',
  ],
};
