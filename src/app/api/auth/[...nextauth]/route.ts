import { NextRequest, NextResponse } from 'next/server'

/**
 * Shim de compatibilidade para /api/auth/[...nextauth].
 *
 * O projeto NÃO usa next-auth em runtime — a autenticação real é o JWT próprio
 * (src/lib/auth.ts + cookie `auth-token`), e as páginas cliente usam useClientSession()
 * (src/lib/session.ts). O handler do next-auth v5 beta não é compatível com a validação
 * de route handlers do Next 16 (`NextAuthResult` não é GET/POST válido), por isso esta
 * rota devolve agora uma resposta JSON informativa em vez de rebentar o build.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Esta aplicação usa autenticação JWT própria. Use /api/auth/login, /api/auth/logout ou /api/auth/me.',
    providers: ['credentials'],
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}

