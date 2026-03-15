#!/usr/bin/env bash

# Aldeias Games - Setup de Desenvolvimento
# Este script prepara o ambiente de desenvolvimento local

set -e  # Sai em caso de erro

echo "🎮 Aldeias Games - Setup de Desenvolvimento"
echo "=========================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instala Node.js 22+ de https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "⚠️  Node.js versão $NODE_VERSION detectada. É recomendado Node 22+."
    echo "   Considera atualizar com: nvm install 22 && nvm use 22"
fi

# Verificar se o banco de dados está configurado
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Variável DATABASE_URL não configurada."
    echo "   Sugestões:"
    echo "   - Local SQLite: export DATABASE_URL=\"file:./dev.db\""
    echo "   - Turso: export DATABASE_URL=\"<sua-url-turso>\""
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Copiar ficheiro de ambiente
if [ ! -f .env.local ]; then
    echo "📝 Criando .env.local a partir de .env.example..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  IMPORTANTE: Edita .env.local com as tuas credenciais reais!"
    echo "   - DATABASE_URL"
    echo "   - GITHUB_TOKEN (para APIs de repositório)"
    echo "   - NEXTAUTH_SECRET (gera com: openssl rand -base64 32)"
    echo "   - NEXTAUTH_URL (ex: http://localhost:3000)"
fi

# Executar migrations do Prisma
echo "🗄️  Executando migrations do Prisma..."
npx prisma migrate dev --name init

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

echo ""
echo "✅ Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   - Edita .env.local com as tuas credenciais"
echo "   - Executa: npm run dev"
echo "   - Abre: http://localhost:3000"
echo ""
echo "🚀 Boa codificação!"