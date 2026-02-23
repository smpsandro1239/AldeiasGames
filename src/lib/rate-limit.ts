// Rate Limiting simples em memória
// Para produção, usar Redis ou similar

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// Limpar entradas antigas a cada minuto
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (entry.resetTime < now) {
      rateLimits.delete(key);
    }
  }
}, 60000);

export interface RateLimitConfig {
  windowMs: number;  // Janela de tempo em milissegundos
  maxRequests: number; // Máximo de requests por janela
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Autenticação
  'auth/login': { windowMs: 60000, maxRequests: 5 },      // 5 tentativas por minuto
  'auth/register': { windowMs: 60000, maxRequests: 3 },    // 3 registos por minuto
  'auth/reset': { windowMs: 60000, maxRequests: 2 },       // 2 resets por minuto
  
  // API geral
  'api/default': { windowMs: 60000, maxRequests: 100 },    // 100 requests por minuto
  'api/heavy': { windowMs: 60000, maxRequests: 20 },       // 20 requests pesados por minuto
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
    rateLimits.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
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
