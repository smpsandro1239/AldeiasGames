import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function alterarParticipacao(id: string, data: any) {
  return await db.participacao.update({
    where: { id },
    data: {
      tipoAlteracao: data.tipoAlteracao || 'atualizacao',
      posicao: data.posicao || '',
      infoAdicional: data.infoAdicional || '',
    },
  });
}
