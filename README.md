# 🎮 Aldeias Games 2026 - Digital Fundraising Platform

![Version](https://img.shields.io/badge/version-3.11.0--dev-indigo)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black)
![Tailwind](https://img.shields.io/badge/CSS-Tailwind%204-blue)

**Aldeias Games** é uma plataforma SaaS (Software as a Service) multi-tenant de alto desempenho, focada na dinamização de comunidades locais portuguesas através de jogos tradicionais digitalizados para angariação de fundos.

## 🚀 Funcionalidades Principais

### Para Utilizadores (Jogadores)
- **Jogos Interativos**: Poio da Vaca (grelha), Rifa/Tombola e Raspadinhas Digitais.
- **Experiência Imersiva**: Efeitos sonoros processuais e visuais (confetti) via Web Audio API.
- **Pagamentos Seguros**: Integração com Stripe e suporte para MBWay.
- **App PWA**: Instalável em qualquer smartphone com suporte offline.

### Para Organizações (Aldeias/Escolas/Clubes)
- **Gestão de Campanhas**: Criação e monitorização de eventos de angariação.
- **CRM e Analytics**: Acompanhamento de vendas, participantes e metas financeiras.
- **Wizard de Configuração**: Configuração guiada e conformidade legal integrada.

### Segurança e Transparência
- **Auditoria de Sorteios**: Algoritmos baseados em SHA-256 (Seed/Hash) para garantir justiça.
- **Proteção de Dados**: Conformidade total com RGPD (EU/PT 2026).
- **Rate Limiting**: Defesa nativa contra bots e ataques DDoS.

## 🏗️ Stack Tecnológica

- **Frontend**: React 19, Next.js 16, TypeScript, Tailwind CSS 4, Framer Motion.
- **Backend**: Next.js API Routes, Prisma ORM.
- **Base de Dados**: SQLite (Dev) / PostgreSQL (Prod).
- **Pagamentos**: Stripe API.
- **Infra**: Docker, Caddy Server.

## 📂 Estrutura de Pastas

```text
src/
├── app/          # Rotas e Endpoints de API (App Router)
├── components/   # Componentes UI (Shadcn + Custom) e Modais
├── features/     # Módulos de negócio complexos (Admin, Vendedor, Cliente)
├── hooks/        # Lógica de negócio e estado (Zustand, React Query)
├── lib/          # Utilitários, Motores (Auth, DB, Stripe, Storage)
├── types/        # Tipagem centralizada e rigorosa
└── proxy.ts # Camada de segurança global (Rate Limit/Auth)
```

## ⚙️ Instalação e Execução

### Pré-requisitos
- Node.js 20+ ou Bun 1.1+
- Docker (opcional para deploy)

### Passos
1. **Clonar o repositório**
   ```bash
   git clone https://github.com/your-repo/aldeias-games.git
   ```
2. **Instalar dependências**
   ```bash
   bun install
   ```
3. **Configurar Variáveis de Ambiente**
   Crie um ficheiro `.env` baseado no `.env.example`.
4. **Preparar Base de Dados**
   ```bash
   bunx prisma db push
   bunx prisma db seed
   ```
5. **Iniciar em Desenvolvimento**
   ```bash
   bun run dev
   ```

## 📊 Documentação Visual

- [Diagramas de Arquitetura e Fluxo](TECHNICAL_AUDIT.md#6-documentacao-visual)
- [Relatório de Auditoria Detalhado](TECHNICAL_AUDIT.md)
- [Especificação API OpenAPI](src/lib/openapi.ts)

## 🛡️ Auditoria Técnica e Qualidade

O projeto foi submetido a uma auditoria profunda em 23/02/2026, resultando em:
- **Modularização de 100%** do código (Padrão Hooks + Features).
- **Performance Otimizada**: Migração de imagens para filesystem.
- **Segurança Reforçada**: Validação Zod em todas as entradas e segredos JWT encriptados.

## 📅 Roadmap 2026+

- [ ] Implementação de WebSockets para notificações em tempo real.
- [ ] Integração com Google Pay e Apple Pay.
- [ ] Módulo de Leilões Silenciosos.
- [ ] App Nativa (iOS/Android) via Capacitor.

---

**Desenvolvido com ❤️ para as aldeias de Portugal.**
