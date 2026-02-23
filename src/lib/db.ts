import { PrismaClient } from '@prisma/client'

// Force re-creation of PrismaClient to pick up new models (logAcesso)
// Using a unique symbol to force cache invalidation
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Always create new client to ensure schema changes are picked up
export const db = new PrismaClient({
  log: ['query'],
})

// Cache for future requests
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}