// Rate Limiting simples em memória
// Para produção escala, usar Redis ou Upstash

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// Limpeza periódica (apenas se não estivermos no middleware do Next.js Edge)
if (typeof window === 'undefined' && typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimits.entries()) {
      if (entry.resetTime < now) {
        rateLimits.delete(key);
      }
    }
  }, 60000);
}

export interface RateLimitConfig {
  windowMs: number;  // Janela de tempo em milissegundos
  maxRequests: number; // Máximo de requests por janela
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Autenticação
  'auth/login': { windowMs: 60000, maxRequests: 10 },      // 10 tentativas por minuto
  'auth/register': { windowMs: 60000, maxRequests: 5 },    // 5 registos por minuto
  'auth/reset': { windowMs: 60000, maxRequests: 3 },       // 3 resets por minuto
  
  // API geral
  'api/default': { windowMs: 60000, maxRequests: 200 },    // 200 requests por minuto
  'api/heavy': { windowMs: 60000, maxRequests: 50 },       // 50 requests pesados por minuto
};

export function checkRateLimit(
  identifier: string, 
  endpoint: string
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS['api/default'];
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  
  const entry = rateLimits.get(key);
  
  if (!entry || entry.resetTime < now) {
    // Criar nova entrada
    const newEntry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimits.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime
    };
  }
  
  if (entry.count >= config.maxRequests) {
    // Limite excedido
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  // Incrementar contador
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

export function getClientIdentifier(request: Request): string {
  // Tentar obter IP do request
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback para user-agent (menos ideal)
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `ua:${userAgent.slice(0, 50)}`;
}
