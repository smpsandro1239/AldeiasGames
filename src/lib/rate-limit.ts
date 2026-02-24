import { NextRequest } from 'next/server';

/**
 * Rate Limiter em memoria - adequado para desenvolvimento e instancia unica.
 *
 * ATENCAO: Em producao com multiplas instancias (Docker Swarm, Kubernetes etc.)
 * migrar para solucao distribuida como:
 * - Upstash Redis: https://upstash.com
 * - @vercel/kv
 * - ioredis com Redis standalone
 *
 * Exemplo com Upstash: https://github.com/upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpar entradas expiradas a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Numero maximo de pedidos permitidos na janela */
  maxRequests: number;
  /** Duracao da janela em milissegundos */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Verifica se um pedido deve ser limitado.
 * @param key Identificador unico (IP, userId, etc.)
 * @param config Configuracao dos limites
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60_000 }
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.maxRequests - 1, resetAt };
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  store.set(key, entry);
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Extrai o IP real do pedido, considerando proxies.
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('cf-connecting-ip') ??
    'unknown'
  );
}

/**
 * Middleware helper para aplicar rate limiting facilmente nas rotas.
 */
export function createRateLimiter(
  maxRequests: number,
  windowMs: number,
  keyPrefix = 'rl'
) {
  return (request: NextRequest) => {
    const ip = getClientIp(request);
    const key = `${keyPrefix}:${ip}`;
    return rateLimit(key, { maxRequests, windowMs });
  };
}

// Limitadores pre-configurados
export const authLimiter = createRateLimiter(5, 15 * 60 * 1000, 'auth');
export const apiLimiter = createRateLimiter(100, 60 * 1000, 'api');
export const uploadLimiter = createRateLimiter(10, 60 * 1000, 'upload');
