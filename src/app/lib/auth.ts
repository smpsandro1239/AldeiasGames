import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        if (user.status !== 'ATIVO') {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          role: user.role,
          orgId: user.orgId,
          saldo: user.saldo
        }
      }
    })
  ],
  
  adapter: PrismaAdapter(prisma) as any,
  
  session: {
    strategy: 'jwt'
  },
  
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error'
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
          orgId: user.orgId,
          saldo: user.saldo
        }
      }
      return token
    },
    
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          orgId: token.orgId,
          saldo: token.saldo
        }
      }
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}