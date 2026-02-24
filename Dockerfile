FROM oven/bun:1 AS base
WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build da aplicacao
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bunx prisma generate && bun run build

# Imagem final de producao (minima)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiar ficheiros necessarios
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Criar diretorios necessarios
RUN mkdir -p /app/prisma/db /app/public/uploads

# Utilizador nao root para seguranca
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Verificacao de saude
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api || exit 1

CMD ["node", "server.js"]
