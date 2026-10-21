import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// next-auth v5 (beta) usa o handler exportado como `handler` com GET/POST
const handler = NextAuth(authOptions as any)

export { handler as GET, handler as POST }
