# 🎮 Aldeias Games

> **Plataforma SaaS multi-tenant para angariação de fundos através de jogos tradicionais.**

[![Versão](https://img.shields.io/badge/Versão-3.8.1--dev-blue)](https://github.com)
[![Licença](https://img.shields.io/badge/Licença-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38b2ac)](https://tailwindcss.com)

## 📋 Índice
1. [Sobre](#-sobre)
2. [Objetivos](#-objetivos)
3. [Funcionalidades](#-funcionalidades)
4. [Arquitetura Técnica](#-arquitetura-técnica)
5. [Instalação](#-instalação)
6. [Estrutura de Pastas](#-estrutura-de-pastas)
7. [Problemas Conhecidos](#-problemas-conhecidos)
8. [Roadmap](#-roadmap)

---

## 📖 Sobre

**Aldeias Games** é uma solução digital inovadora desenhada para apoiar aldeias, associações de pais, escolas e clubes na sua missão de angariação de fundos. Através da digitalização de jogos clássicos como o "Poio da Vaca", a plataforma oferece transparência, facilidade de participação e gestão profissional.

## 🎯 Objetivos
- Facilitar a angariação de fundos para comunidades locais.
- Garantir a **transparência total** nos sorteios através de criptografia.
- Oferecer uma experiência moderna e acessível (Mobile-first & PWA).
- Centralizar a gestão de múltiplos eventos e organizações numa única infraestrutura (SaaS).

## ✨ Funcionalidades

### Existentes ✅
- **Multi-tenancy**: Isolamento total entre aldeias e organizações.
- **Jogos Customizáveis**:
  - 🐄 **Poio da Vaca**: Grelha interativa com coordenadas.
  - 🎟️ **Rifa/Tombola**: Números da sorte.
  - 🃏 **Raspadinhas**: Resultados imediatos com seed verificável.
- **Gestão de Roles**: 4 níveis de permissão (Super Admin -> Admin -> Vendedor -> Jogador).
- **Relatórios**: Exportação em CSV e PDF.
- **Auditoria**: Logs de acesso e histórico de alterações em participações.
- **Backups**: Sistema de proteção de dados integrado.
- **RGPD**: Ferramentas de exportação e eliminação de dados pessoais.

### Em Falta / Planeadas ⏳
- 💳 Integração completa com Stripe (Pagamentos Online).
- 📱 App Móvel Nativa (API pronta, app em planeamento).
- 🔔 Notificações Push em tempo real.
- 🔗 Webhooks para integrações externas.

## ⚙️ Arquitetura Técnica

A plataforma utiliza uma stack moderna focada em performance e DX:

- **Frontend**: React 19 + Next.js 16 (App Router).
- **Estilos**: Tailwind CSS 4 com suporte nativo a Dark Mode.
- **Base de Dados**: SQLite gerenciado via Prisma ORM.
- **Estado**: Zustand para estado global e React Query para cache de servidor.
- **Segurança**: Autenticação baseada em JWT (Jose) com hashing Bcrypt.

### Fluxo de Sorteio Transparente
1. Uma `seed` aleatória é gerada.
2. O `hash` da seed é publicado antes do sorteio.
3. Após o sorteio, a `seed` é revelada, permitindo que qualquer utilizador valide o resultado usando o algoritmo padrão.

## 🚀 Instalação

### Pré-requisitos
- Node.js 20+ ou **Bun** (recomendado)
- SQLite

### Passos
```bash
# 1. Clonar o repositório
git clone https://github.com/org/aldeias-games.git

# 2. Instalar dependências
bun install

# 3. Configurar ambiente
cp .env.example .env

# 4. Preparar base de dados
bunx prisma db push
bunx prisma db seed

# 5. Iniciar desenvolvimento
bun dev
```

## 📂 Estrutura de Pastas

```text
src/
├── app/                  # Rotas e API (App Router)
│   ├── api/              # Endpoints da API REST
│   └── (routes)/         # Páginas e Layouts
├── components/           # Componentes UI (Shadcn)
├── hooks/                # Hooks customizados
├── lib/                  # Utilitários (Auth, DB, Utils)
└── prisma/               # Schema e Migrações
```

## ⚠️ Problemas Conhecidos e Auditoria

Uma auditoria técnica recente identificou os seguintes pontos de atenção:
- **Acoplamento**: A página principal (`page.tsx`) necessita de refatoração urgente (9k+ linhas).
- **Segurança**: Necessidade de remover fallbacks de chaves JWT.
- **Performance**: Armazenamento de imagens em Base64 no SQLite deve ser migrado para S3/Filesystem.

Para mais detalhes, consulte o [Relatório de Auditoria Técnica](./TECHNICAL_AUDIT.md).

## 🗺️ Roadmap Sugerido

1. **Q1 2025**: Refatoração da interface principal e implementação de Zod.
2. **Q2 2025**: Finalização da integração Stripe e Webhooks.
3. **Q3 2025**: Lançamento da API Pública para App Móvel.
4. **Q4 2025**: Implementação de WebSockets para atualizações em tempo real.

---

Desenvolvido com foco no impacto social e transparência. 🚀
