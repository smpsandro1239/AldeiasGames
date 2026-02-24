# 🔍 AUDITORIA TÉCNICA COMPLETA — Aldeias Games 2026

> **Data da Auditoria:** 2026-02-24  
> **Auditor:** Agent Zero — Análise Automatizada Profunda  
> **Versão Auditada:** 3.11.0-dev  
> **Ficheiros Analisados:** 180+ ficheiros  
> **Estado Geral:** ⚠️ Pronto para Dev — Requer correções antes de Produção

---

## 📋 ÍNDICE

1. [Análise Geral do Projeto](#1-análise-geral-do-projeto)
2. [Estrutura de Pastas](#2-estrutura-de-pastas)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Análise Detalhada por Camada](#4-análise-detalhada-por-camada)
5. [Problemas Encontrados](#5-problemas-encontrados)
6. [O que está Feito vs O que Falta](#6-o-que-está-feito-vs-o-que-falta)
7. [Segurança](#7-segurança)
8. [Performance](#8-performance)
9. [Qualidade de Código](#9-qualidade-de-código)
10. [Infraestrutura e Deploy](#10-infraestrutura-e-deploy)
11. [Testes](#11-testes)
12. [Melhorias e Recomendações](#12-melhorias-e-recomendações)
13. [Arquitetura Visual](#13-arquitetura-visual)
14. [Resumo Executivo Final](#14-resumo-executivo-final)

---

## 1. ANÁLISE GERAL DO PROJETO

### 1.1 Missão e Contexto

**Aldeias Games** é uma plataforma **SaaS multi-tenant** para comunidades locais portuguesas (aldeias, escolas, clubes, associações) realizarem angariação de fundos digitalmente através de jogos tradicionais digitalizados.

### 1.2 Objetivos do Produto

| Objetivo | Estado |
|----------|--------|
| Digitalizar rifas e jogos tradicionais | ✅ Implementado |
| Plataforma multi-tenant (múltiplas aldeias) | ✅ Implementado |
| Pagamentos seguros (Stripe + MBWay) | ⚠️ Parcial (MBWay simulado) |
| PWA instalável em smartphone | ✅ Implementado |
| Conformidade RGPD | ✅ Implementado |
| SaaS com planos e subscrições | ⚠️ Parcial (Plano sem schema DB) |
| Sorteios transparentes e auditáveis | ✅ Implementado (SHA-256) |

### 1.3 Padrão Arquitetural

O projeto usa uma **Arquitetura Modular em Camadas** sobre Next.js 16 App Router:

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                    │
│  page.tsx (Orquestrador) → Features → Components → UI       │
├─────────────────────────────────────────────────────────────┤
│                    CAMADA DE LÓGICA                          │
│  Custom Hooks (use-auth, use-dashboard, use-participacoes)   │
├─────────────────────────────────────────────────────────────┤
│                    CAMADA DE API                             │
│  Next.js API Routes (/api/*)                                 │
├─────────────────────────────────────────────────────────────┤
│                    CAMADA DE SEGURANÇA                       │
│  middleware.ts (Rate Limit) + JWT Auth + Zod Validation      │
├─────────────────────────────────────────────────────────────┤
│                    CAMADA DE DADOS                           │
│  Prisma ORM → SQLite (dev) / PostgreSQL (prod)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ESTRUTURA DE PASTAS

```
AldeiasGames/
├── 📁 src/
│   ├── 📁 app/                    # App Router Next.js
│   │   ├── 📁 api/                # 25+ endpoints REST
│   │   │   ├── aldeias/           # CRUD Aldeias
│   │   │   ├── auth/              # Login + Register
│   │   │   ├── backup/            # Backup/Restore DB
│   │   │   ├── eventos/           # CRUD Eventos
│   │   │   ├── jogos/             # CRUD Jogos
│   │   │   ├── participacoes/     # CRUD + Raspadinha
│   │   │   ├── premios/           # CRUD Prémios
│   │   │   ├── sorteios/          # Motor de Sorteio
│   │   │   ├── stripe/            # Pagamentos Stripe
│   │   │   ├── users/             # Gestão Utilizadores
│   │   │   ├── planos/            # ⚠️ Planos SaaS (sem schema)
│   │   │   └── ...               # export, logs, push, emails
│   │   ├── api-docs/             # Swagger UI
│   │   ├── page.tsx              # Orquestrador Principal
│   │   ├── layout.tsx            # Layout Root
│   │   └── globals.css           # Estilos Globais
│   ├── 📁 components/
│   │   ├── 📁 modals/            # 11 modais independentes
│   │   ├── 📁 ui/                # 50+ componentes Shadcn
│   │   └── 📁 layout/           # Header, etc.
│   ├── 📁 features/              # Views por Role
│   │   ├── AdminDashboardView    # Super Admin + Aldeia Admin
│   │   ├── ClienteDashboardView  # Jogador
│   │   ├── VendedorDashboardView # Vendedor
│   │   ├── CRMAdminView          # CRM Super Admin
│   │   └── OrganizacaoDashboardView # ⚠️ NUNCA USADO
│   ├── 📁 hooks/                 # 9 Custom Hooks
│   ├── 📁 lib/                   # Motores: auth, db, stripe...
│   ├── 📁 types/                 # Tipos TypeScript centralizados
│   ├── 📁 store/                 # Zustand Store
│   └── 📁 __tests__/            # Testes Jest
├── 📁 prisma/
│   ├── schema.prisma             # Modelo de Dados
│   ├── seed.ts                   # Dados Iniciais
│   └── db/custom.db              # ⚠️ DB duplicada
├── 📁 db/custom.db               # ⚠️ DB duplicada
├── 📁 public/
│   ├── sw.js                     # Service Worker PWA
│   └── logo.svg                  # Logo
├── 📁 scripts/                   # ⚠️ Scripts Python dev (não deviam estar aqui)
├── 📁 examples/                  # ⚠️ Código de exemplo não integrado
├── 📁 mini-services/             # ⚠️ Pasta vazia (.gitkeep)
├── Dockerfile                    # Container Docker
├── docker-compose.yml            # Orquestração
├── Caddyfile                     # Reverse Proxy
└── package.json                  # Dependências
```

---

## 3. STACK TECNOLÓGICA

| Categoria | Tecnologia | Versão | Avaliação |
|-----------|-----------|--------|----------|
| **Framework** | Next.js | 16.x | ✅ Excelente |
| **UI Library** | React | 19.x | ✅ Mais recente |
| **Linguagem** | TypeScript | 5.x | ⚠️ Config enfraquecida |
| **CSS** | Tailwind CSS | 4.x | ✅ Excelente |
| **Componentes** | Shadcn/UI + Radix | latest | ✅ Excelente |
| **ORM** | Prisma | 6.x | ✅ Sólido |
| **DB Dev** | SQLite | - | ✅ Adequado para dev |
| **DB Prod** | PostgreSQL | - | ✅ Recomendado |
| **Auth** | JWT (jose) | 6.x | ⚠️ Sem refresh token |
| **Pagamentos** | Stripe | 20.x | ⚠️ Não configurado |
| **Animações** | Framer Motion | 12.x | ✅ Excelente |
| **State** | Zustand | 5.x | ✅ Moderno |
| **Forms** | React Hook Form + Zod | latest | ✅ Excelente |
| **Testes** | Jest | 30.x | ⚠️ Cobertura parcial |
| **Runtime** | Bun | 1.x | ✅ Rápido |
| **Deploy** | Docker + Caddy | latest | ⚠️ Config incompleta |

---

## 4. ANÁLISE DETALHADA POR CAMADA

### 4.1 Orquestrador — `src/app/page.tsx` (255 linhas)

**O que faz:** Componente raiz da aplicação. Gere autenticação, navegação, sidebar, modais e routing por role.

**Pontos Positivos:**
- ✅ Bem refatorado — apenas 255 linhas (veio de ~9600!)
- ✅ Uso correto de hooks personalizados
- ✅ `useMemo` para filtragem de eventos
- ✅ Gestão de modais centralizada com objeto de estado

**Problemas:**
- ⚠️ `Bell` button sem onClick para abrir NotificacoesModal
- ⚠️ `OrganizacaoDashboardView` importada mas nunca renderizada
- ⚠️ `filteredEventos` só filtra por `ev.nome` e `ev.descricao` mas acesso `.descricao` pode falhar se undefined
- ⚠️ Dois `<Toaster>` ativos (Sonner + shadcn) — podem conflituar

### 4.2 API Routes — `src/app/api/`

**25+ endpoints REST implementados.**

| Endpoint | Método | Auth | Zod | Status |
|----------|--------|------|-----|--------|
| /api/auth/login | POST | ❌ | ✅ | ✅ |
| /api/auth/register | POST | ❌ | ⚠️ | ✅ |
| /api/aldeias | GET/POST | ⚠️ | ✅ | ✅ |
| /api/eventos | GET/POST | ⚠️ | ✅ | ✅ |
| /api/jogos | GET/POST | ⚠️ | ✅ | ✅ |
| /api/participacoes | GET/POST | ✅ | ✅ | ✅ |
| /api/sorteios/[id] | POST | ✅ | ✅ | ✅ |
| /api/planos | GET/POST | ❌ | ❌ | 🔴 CRASH |
| /api/backup | GET/POST | ⚠️ | ❌ | ⚠️ |
| /api/export | GET | ⚠️ | ❌ | ⚠️ |
| /api/stripe/webhook | POST | ❌ | ❌ | ⚠️ |

### 4.3 Base de Dados — `prisma/schema.prisma`

**Modelos implementados:**
- ✅ User, Aldeia, Evento, Jogo
- ✅ Participacao, Sorteio, Premio
- ✅ Notificacao, PushSubscription, LogAcesso
- 🔴 **Plano — AUSENTE** (usado em seed.ts e planos/route.ts!)

**Qualidade do Schema:**
- ✅ Índices definidos para performance (userId, jogoId, referencia)
- ✅ Suporte dual SQLite/PostgreSQL
- ⚠️ Participacao tem campos **duplicados**: `revelada` E `revelado` (ambos Boolean)
- ⚠️ Aldeia tem tanto `logoUrl` como `logoBase64` — redundância não resolvida
- ⚠️ Evento tem tanto `imageUrl` como `imagemBase64` — mesma redundância

### 4.4 Autenticação — `src/lib/auth.ts`

**Pontos Positivos:**
- ✅ bcrypt com salt rounds 10
- ✅ JWT via jose (moderno, edge-compatible)
- ✅ Erro em produção se JWT_SECRET ausente

**Problemas:**
- ⚠️ Fallback `dev-secret-key-insecure-only-for-local-development` ainda presente
- ⚠️ JWT expira em 7 dias — sem refresh token
- ⚠️ Apenas Bearer token — sem suporte a cookies (comentário "para futuro")
- ⚠️ `getUserFromRequest` aceita `Request` — casting problemático no middleware
- ⚠️ Não regista tentativas de login falhadas para emails inexistentes

### 4.5 Rate Limiting — `src/lib/rate-limit.ts`

**Pontos Positivos:**
- ✅ Regras diferenciadas por endpoint
- ✅ Headers de rate limit na resposta
- ✅ Limpeza periódica do Map

**Problemas Críticos:**
- 🔴 **In-memory Map** — não persiste entre reinícios do processo
- 🔴 Não funciona com **múltiplas instâncias** do servidor
- ⚠️ Fallback para User-Agent se sem IP — facilmente contornável
- ⚠️ Sem rate limit por utilizador autenticado

### 4.6 Service Worker — `public/sw.js`

**Problemas:**
- 🔴 Cacheia `/api/jogos`, `/api/eventos`, `/api/aldeias` — dados dinâmicos em cache!
- ⚠️ Estratégia Cache-First para toda a app — utilizador pode ver dados obsoletos
- ⚠️ Sem estratégia de atualização em background
- ⚠️ Sem manifest.json referenciado

### 4.7 Docker & Deploy

**Dockerfile:**
- ✅ Multi-stage build correto
- ✅ Usa `oven/bun:1` como base
- ⚠️ Não copia `prisma/schema.prisma` para o runner — migrations podem falhar
- ⚠️ Sem healthcheck definido

**docker-compose.yml:**
- ⚠️ `version: "3.8"` está deprecated nas versões modernas do Docker Compose
- ⚠️ Sem restart policy (`restart: unless-stopped`)
- ⚠️ Sem definição de redes isoladas
- ⚠️ Stripe keys não passadas como env vars

**Caddyfile:**
- ⚠️ Escuta em `:81` — configuração de teste, não de produção
- ⚠️ Sem HTTPS automático configurado
- ⚠️ Sem rate limiting ao nível do proxy

### 4.8 TypeScript Config — `tsconfig.json` + `next.config.ts`

**Problemas:**
- 🔴 `next.config.ts`: `ignoreBuildErrors: true` — erros TypeScript ignorados no build!
- 🔴 `tsconfig.json`: `noImplicitAny: false` contradiz `strict: true`
- ⚠️ `reactStrictMode: false` — desativa verificações de segurança do React
- ⚠️ `target: ES2017` — pode ser atualizado para ES2020+

---

## 5. PROBLEMAS ENCONTRADOS

### 🔴 CRÍTICO (Bloqueador de Produção)

| # | Problema | Ficheiro | Impacto |
|---|---------|----------|--------|
| C1 | **Modelo `Plano` ausente no schema Prisma** | `prisma/schema.prisma` | CRASH em runtime ao aceder /api/planos ou executar seed |
| C2 | **ignoreBuildErrors: true** | `next.config.ts` | Erros TypeScript silenciados — bugs escondidos em produção |
| C3 | **Rate Limit em memória** | `src/lib/rate-limit.ts` | Ineficaz em multi-instância e após restart |
| C4 | **Service Worker cacheia endpoints de API** | `public/sw.js` | Utilizadores recebem dados obsoletos |
| C5 | **Stripe com fallback dummy** | `src/lib/stripe.ts` | Pagamentos falham silenciosamente sem config |
| C6 | **Dois ficheiros SQLite** | `db/custom.db` + `prisma/db/custom.db` | Dados em bases diferentes, inconsistência |

### 🟠 IMPORTANTE

| # | Problema | Ficheiro | Impacto |
|---|---------|----------|--------|
| I1 | **Sem .env.example** | Raiz do projeto | Developers não sabem variáveis necessárias |
| I2 | **Bell sem handler** | `page.tsx` | Notificações inacessíveis pelo utilizador |
| I3 | **OrganizacaoDashboardView nunca renderizado** | `page.tsx` | Feature inativa sem aviso |
| I4 | **noImplicitAny: false** | `tsconfig.json` | TypeScript permissivo — erros de tipo silenciados |
| I5 | **JWT sem refresh token** | `src/lib/auth.ts` | Sessão expira em 7d sem renovação automática |
| I6 | **LogAcesso.userId NOT NULL** | `prisma/schema.prisma` | Não consegue registar tentativas com emails inválidos |
| I7 | **Sem favicon.ico** | `public/` | Metadata referencia favicon inexistente |
| I8 | **package-lock.json + bun.lock** | Raiz | Conflito de package managers (npm vs bun) |
| I9 | **Caddyfile em modo teste (:81)** | `Caddyfile` | Configuração incorreta para produção |
| I10 | **notificacoes-modal.tsx não usado** | `src/components/` | Dead code |
| I11 | **Dois `<Toaster>` ativos** | `page.tsx` + `layout.tsx` | Notificações duplicadas possíveis |
| I12 | **Sem CSRF protection** | API Routes | Vulnerável a ataques cross-site |

### 🟡 MODERADO

| # | Problema | Ficheiro | Impacto |
|---|---------|----------|--------|
| M1 | **Campos duplicados revelada/revelado** | `prisma/schema.prisma` | Confusão e dados inconsistentes |
| M2 | **logoUrl + logoBase64 duplicados** | `prisma/schema.prisma` | Redundância de dados |
| M3 | **Tipo `configuracao` vs campo DB `config`** | `types/project.ts` | Mismatch entre frontend e backend |
| M4 | **Sem paginação nas APIs de listagem** | API Routes | Performance degradada com muitos dados |
| M5 | **Password mínimo 6 caracteres** | `src/lib/validations.ts` | Segurança de conta fraca |
| M6 | **Scripts Python no repositório** | `scripts/` | Artefactos de dev não deviam estar no repo |
| M7 | **Pasta mini-services vazia** | `mini-services/` | Placeholder sem propósito claro |
| M8 | **reactStrictMode: false** | `next.config.ts` | Problemas de React não detetados em dev |
| M9 | **Header.tsx existe mas não é usado** | `src/components/layout/` | Header no layout.tsx usa código inline |
| M10 | **Sem validação Zod no /api/register** | `src/app/api/auth/register/route.ts` | Dados de registo sem validação completa |

### 🔵 COSMÉTICO

| # | Problema | Ficheiro | Impacto |
|---|---------|----------|--------|
| CO1 | **worklog.md, roles.md, todolist.md no repo** | Raiz | Documentação interna exposta |
| CO2 | **docker-compose.yml version deprecated** | `docker-compose.yml` | Warning no compose up |
| CO3 | **Comentários TODO no código** | Vários | Dívida técnica documentada mas não resolvida |
| CO4 | **console.log em produção** | API routes | Logs de debug em produção |
| CO5 | **try/catch vazio no login** | `auth/login/route.ts` | Erro de `ultimoLogin` silenciado |

---

## 6. O QUE ESTÁ FEITO VS O QUE FALTA

### ✅ Completamente Implementado

- [x] Sistema de autenticação JWT (login, registo, logout)
- [x] 4 roles com permissões distintas (super_admin, aldeia_admin, vendedor, user)
- [x] CRUD completo para Aldeias, Eventos, Jogos, Prémios
- [x] Jogo Poio da Vaca (grelha interativa)
- [x] Jogo Rifa/Tombola com seletor de números
- [x] Jogo Raspadinha com canvas real e efeito de raspagem
- [x] Sistema de sorteio com seed + hash SHA-256 (auditável)
- [x] Dashboard por role (Admin, Vendedor, Cliente)
- [x] CRM Admin View
- [x] Rate limiting em middleware
- [x] Validação Zod nas rotas críticas
- [x] Prisma ORM com suporte dual SQLite/PostgreSQL
- [x] Service Worker + PWA básico
- [x] Push Notifications (subscribe/send)
- [x] Dark mode
- [x] Exportação CSV
- [x] Backup/Restore da base de dados
- [x] Logs de acesso
- [x] Conformidade RGPD (exportar/apagar dados)
- [x] OpenAPI/Swagger documentation
- [x] Motor de som processual (Web Audio API)
- [x] Efeitos visuais (confetti)
- [x] Gestão de prémios
- [x] Histórico de pagamentos
- [x] Perfil de utilizador editável
- [x] Cookie Banner + Legal Compliance
- [x] Wizard de configuração de aldeia
- [x] Sistema de notificações internas
- [x] Upload de imagens (base64 → filesystem)
- [x] Testes unitários e de integração

### ❌ Incompleto ou Ausente

- [ ] 🔴 **Modelo Plano na DB** — referenciado mas inexistente
- [ ] 🔴 **MBWay real** — apenas simulado/referência, sem integração real
- [ ] 🟠 **WebSockets** — apenas exemplo em `examples/` não integrado
- [ ] 🟠 **Refresh Token** — JWT expira sem renovação
- [ ] 🟠 **Bell Notification Handler** — botão sem função
- [ ] 🟠 **NotificacoesModal** — componente criado mas não usado
- [ ] 🟠 **OrganizacaoDashboardView** — importado mas não renderizado
- [ ] 🟠 **Stripe totalmente configurado** — requer variáveis de ambiente
- [ ] 🟠 **HTTPS no Caddy** — não configurado para produção
- [ ] 🟡 **Paginação nas APIs** — endpoints retornam tudo
- [ ] 🟡 **Relatórios PDF** — no roadmap, não implementado
- [ ] 🟡 **App Mobile Nativa** — no roadmap
- [ ] 🟡 **Google Pay / Apple Pay** — no roadmap
- [ ] 🟡 **Leilões Silenciosos** — no roadmap
- [ ] 🟡 **manifest.json completo** — referenciado mas incompleto
- [ ] 🟡 **favicon.ico** — referenciado mas ausente
- [ ] 🟡 **.env.example** — ausente, necessário para onboarding

---

## 7. SEGURANÇA

### 7.1 Matriz de Segurança

| Vetor | Proteção | Severidade | Estado |
|-------|----------|-----------|--------|
| Força bruta login | Rate Limit (10/min) | Alto | ✅ Implementado |
| SQL Injection | Prisma parameterized | Alto | ✅ Seguro |
| JWT Secret exposto | ENV check produção | Crítico | ⚠️ Fallback inseguro |
| XSS | React escaping | Alto | ✅ Por padrão |
| CSRF | ❌ Sem proteção | Importante | 🔴 Ausente |
| File Upload RCE | UUID + extensão válida | Alto | ✅ Mitigado |
| Stripe Webhook | ⚠️ Sem verificação signature | Alto | ⚠️ Parcial |
| Rate Limit bypass | User-Agent fallback | Moderado | ⚠️ Contornável |
| Dados em cache | SW cacheia APIs | Importante | 🔴 Problemático |
| Password fraca | Min 6 chars | Moderado | ⚠️ Insuficiente |

### 7.2 Recomendações de Segurança

1. **CSRF:** Adicionar token CSRF ou usar SameSite=Strict em cookies
2. **Rate Limit:** Migrar para Redis/Upstash para persistência
3. **Stripe Webhook:** Verificar `stripe-signature` header
4. **Password:** Aumentar mínimo para 8 chars + complexidade
5. **JWT:** Implementar refresh token com rotação
6. **Headers:** Adicionar Helmet.js ou security headers no Caddy

---

## 8. PERFORMANCE

### 8.1 Pontos Positivos

- ✅ `useMemo` para filtragem de eventos
- ✅ Singleton PrismaClient (evita conexões múltiplas)
- ✅ Índices na base de dados (userId, jogoId, referencia)
- ✅ Standalone output no Next.js
- ✅ Imagens em filesystem (não Base64 na DB)
- ✅ Tree shaking com modais separados

### 8.2 Problemas de Performance

- 🟠 **Sem paginação** — GET /api/participacoes devolve TODOS os registos
- 🟠 **Service Worker com cache agressivo** — dados de API em cache
- 🟡 **Sem lazy loading** de features por role
- 🟡 **Sem React.Suspense** para carregamento de componentes pesados
- 🟡 **Imagens sem optimização** — Sharp instalado mas não usado explicitamente

---

## 9. QUALIDADE DE CÓDIGO

### 9.1 Pontos Fortes

- ✅ Arquitetura bem estruturada e modular
- ✅ Tipos TypeScript centralizados em `types/project.ts`
- ✅ Custom hooks separam lógica de apresentação
- ✅ Validação Zod nas rotas críticas
- ✅ Componentes UI Shadcn/Radix reutilizáveis
- ✅ Nomenclatura consistente em português

### 9.2 Problemas de Qualidade

- ⚠️ `noImplicitAny: false` — TypeScript permissivo
- ⚠️ `ignoreBuildErrors: true` — builds com erros silenciados
- ⚠️ `any` usado em vários tipos (configuracao, dadosParticipacao)
- ⚠️ `try/catch` com blocos vazios ou que ignoram erros
- ⚠️ `console.log/error` deixados em código de produção
- ⚠️ Dead code (OrganizacaoDashboardView, notificacoes-modal)
- ⚠️ Dois sistemas de toast ativos (sonner + shadcn/toaster)

---

## 10. INFRAESTRUTURA E DEPLOY

### 10.1 Fluxo de Deploy Atual

```
Developer
    │
    ▼
git push → GitHub
    │
    ▼
Docker Build (multi-stage)
    │ bun install + prisma generate + next build
    ▼
Docker Runner
    │ porta 3000
    ▼
Caddy Reverse Proxy
    │ porta 80/443
    ▼
Utilizador Final
```

### 10.2 Problemas de Deploy

| Problema | Gravidade | Solução |
|---------|-----------|--------|
| Prisma schema não copiado para runner | 🟠 | Adicionar `COPY --from=builder /app/prisma ./prisma` |
| Sem healthcheck no Docker | 🟡 | Adicionar `HEALTHCHECK` |
| Caddy em porta :81 | 🟠 | Configurar para :80/:443 com TLS |
| Sem restart policy | 🟡 | Adicionar `restart: unless-stopped` |
| Dois SQLite (db/ e prisma/db/) | 🔴 | Unificar em prisma/db/ |
| Sem CI/CD pipeline | 🟡 | Adicionar GitHub Actions |

### 10.3 Variáveis de Ambiente Necessárias

```bash
# Base de Dados
DATABASE_URL=file:./prisma/db/custom.db  # SQLite dev
# DATABASE_URL=postgresql://...          # PostgreSQL prod

# Autenticação
JWT_SECRET=<string-com-minimo-32-chars>

# App
NEXT_PUBLIC_BASE_URL=https://seudominio.pt

# Stripe (opcional para dev)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MBWay (sem integração real ainda)
MBWAY_API_KEY=
```

---

## 11. TESTES

### 11.1 Cobertura Atual

| Ficheiro de Teste | O que testa | Estado |
|------------------|------------|--------|
| `__tests__/auth.test.ts` | Hash/verify password, tokens JWT | ✅ |
| `__tests__/sorteio.test.ts` | Hash SHA-256 do sorteio | ✅ |
| `__tests__/raspadinha.test.ts` | Lógica da raspadinha | ✅ |
| `__tests__/validation.test.ts` | Schemas Zod | ✅ |
| `__tests__/api/auth.test.ts` | API login/register | ✅ |
| `__tests__/api/aldeias.test.ts` | API CRUD aldeias | ✅ |
| `__tests__/api/participacoes.test.ts` | API participações | ✅ |
| `lib/__tests__/auth.test.ts` | Funções auth | ✅ |
| `lib/__tests__/utils.test.ts` | Utilitários | ✅ |

### 11.2 O que Falta nos Testes

- ❌ Testes de componentes React (Testing Library)
- ❌ Testes E2E (Playwright/Cypress)
- ❌ Testes de integração para Stripe
- ❌ Testes para lógica de rate limiting
- ❌ Testes para upload de imagens
- ❌ Testes para backup/restore
- ❌ Coverage report configurado

---

## 12. MELHORIAS E RECOMENDAÇÕES

### 12.1 Correções Imediatas (Críticas)

```prisma
// ADICIONAR ao prisma/schema.prisma
model Plano {
  id                String   @id @default(cuid())
  nome              String
  precoMensal       Float
  maxEventos        Int      @default(10)
  maxJogos          Int      @default(50)
  maxParticipacoes  Int      @default(1000)
  descricao         String?
  stripePriceId     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("planos")
}
```

```typescript
// next.config.ts — REMOVER
typescript: {
  ignoreBuildErrors: true, // REMOVER ESTA LINHA
},
reactStrictMode: false, // MUDAR PARA true
```

```typescript
// tsconfig.json — CORRIGIR
"noImplicitAny": true, // MUDAR PARA true
```

### 12.2 Melhorias de Segurança

```typescript
// src/lib/rate-limit.ts — Migrar para Redis
import { Redis } from @upstash/redis'
import { Ratelimit } from @upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

### 12.3 Correção do Service Worker

```javascript
// public/sw.js — NÃO cachear APIs dinâmicas
const urlsToCache = [
  '/',
  // REMOVER: '/api/jogos', '/api/eventos', '/api/aldeias'
];

// Usar Network-First para APIs
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Sempre rede para APIs
    event.respondWith(fetch(event.request));
    return;
  }
  // Cache para assets estáticos
});
```

### 12.4 Criar .env.example

```bash
# Criar: .env.example
DATABASE_URL=file:./prisma/db/custom.db
JWT_SECRET=your-secret-key-minimum-32-characters-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 12.5 Correção do Dockerfile

```dockerfile
# Adicionar ao runner stage
COPY --from=builder /app/prisma ./prisma
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:3000/api || exit 1
```

---

## 13. ARQUITETURA VISUAL

### 13.1 Diagrama de Fluxo de Autenticação

```
Utilizador
    │ POST /api/auth/login
    ▼
Rate Limit (10/min) ──── BLOQUEADO ───► 429
    │ OK
    ▼
Zod Validation ──── INVÁLIDO ───► 400
    │ OK
    ▼
Bcrypt.compare(password, hash)
    │ FALHOU ───► 401
    ▼
JWT.sign(payload, SECRET, 7d)
    │
    ▼
{ user, token } ──► Cliente
    │
    ▼
localStorage.token
    │ Bearer {token}
    ▼
API Routes → getUserFromRequest()
```

### 13.2 Fluxo de Jogo — Raspadinha

```
Jogador
    │ Seleciona N cartões
    ▼
POST /api/participacoes
    │ { tipo: raspadinha, quantidade: N }
    ▼
generateSeed() → 32 bytes aleatórios
    │
    ▼
determinePrize(config%, stockInicial, cardN)
    │
    ▼
generateHash(seed + premio + cardN) → SHA-256
    │
    ▼
DB: { seedRaspe, hashRaspe, resultadoRaspe, revelado: false }
    │
    ▼
ScratchCard Component (Canvas)
    │ Utilizador raspa > 50%
    ▼
POST /api/participacoes/{id}/revelar
    │
    ▼
Verifica hash integridade → Revela resultado
    │
    ▼
{ ganhou, premio } → Confetti 🎉
```

### 13.3 Fluxo Multi-Tenant

```
┌─────────────────────────────────────────────┐
│               Aldeias Games                  │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Vila Verde   │  │ Escola ABC   │        │
│  │ aldeiaId: X  │  │ aldeiaId: Y  │  ...  │
│  │              │  │              │        │
│  │  Eventos     │  │  Eventos     │        │
│  │  Jogos       │  │  Jogos       │        │
│  │  Vendedores  │  │  Vendedores  │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
│  Super Admin: acesso a TUDO                 │
│  Aldeia Admin: acesso apenas à sua aldeia   │
└─────────────────────────────────────────────┘
```

---

## 14. RESUMO EXECUTIVO FINAL

### 14.1 Pontuação por Categoria

| Categoria | Pontuação | Notas |
|-----------|-----------|-------|
| **Arquitetura** | 8.5/10 | Bem estruturada, modular |
| **Segurança** | 6.0/10 | Várias lacunas críticas |
| **Performance** | 7.0/10 | Boa base, sem paginação |
| **Qualidade Código** | 7.5/10 | TypeScript permissivo |
| **Completude** | 8.0/10 | Funcional mas com gaps |
| **Deploy/Infra** | 5.5/10 | Configuração incompleta |
| **Testes** | 6.5/10 | Boa base, sem E2E |
| **Documentação** | 9.0/10 | Excelente documentação |
| **GERAL** | **7.2/10** | Bom projeto com gaps críticos |

### 14.2 Pontos Fortes

✅ Arquitetura modular exemplar — refatoração de 9600 → 255 linhas é impressionante  
✅ Sistema de sorteio com SHA-256 auditável — inovador e transparente  
✅ Motor de som processual via Web Audio API — zero dependências externas  
✅ Raspadinha com canvas real — experiência de utilizador premium  
✅ Documentação excepcional — README, TECHNICAL_AUDIT, roles.md, worklog.md  
✅ Stack moderna e relevante — Next.js 16, React 19, Tailwind 4  

### 14.3 Pontos Fracos Principais

🔴 Modelo Plano ausente no schema — CRASH garantido em produção  
🔴 TypeScript errors ignorados no build — qualidade silenciada  
🔴 Rate limiting efémero — inútil após restart  
🔴 Service Worker com cache de APIs dinâmicas — dados obsoletos  
⚠️ MBWay não integrado realmente — apenas simulado  
⚠️ Deploy incompleto — Caddy sem HTTPS, Docker sem healthcheck  

### 14.4 Prioridades de Correção

| Prioridade | Tarefa | Esforço |
|-----------|--------|--------|
| 🔴 P1 | Adicionar modelo Plano ao schema.prisma | 30 min |
| 🔴 P2 | Remover ignoreBuildErrors + corrigir TS | 2-4h |
| 🔴 P3 | Corrigir Service Worker (não cachear APIs) | 30 min |
| 🔴 P4 | Migrar rate limit para Redis/Upstash | 2h |
| 🟠 P5 | Criar .env.example | 15 min |
| 🟠 P6 | Corrigir Dockerfile (copiar prisma) | 30 min |
| 🟠 P7 | Configurar Caddy para HTTPS produção | 1h |
| 🟠 P8 | Implementar Bell notification handler | 1h |
| 🟠 P9 | Remover campos duplicados (revelada/revelado) | 1h |
| 🟡 P10 | Adicionar paginação nas APIs | 3-4h |

### 14.5 Próximos Passos Recomendados

1. **Imediato (Hoje):** Corrigir P1, P3, P5 — rápido e crítico
2. **Esta Semana:** P2, P4, P6, P7, P8, P9
3. **Próximo Sprint:** P10 + testes E2E + paginação
4. **Roadmap v4.0:** WebSockets, PDF, App Mobile

---

*Auditoria realizada por Agent Zero em 2026-02-24*  
*Todos os ficheiros do projeto foram analisados individualmente.*
