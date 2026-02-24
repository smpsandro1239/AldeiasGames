# Changelog - Aldeias Games

Todas as alteracoes notaveis deste projeto serao documentadas neste ficheiro.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-PT/1.0.0/).
Este projeto segue [Semantic Versioning](https://semver.org/).

## [Nao Lancado]

### Adicionado
- GitHub Actions CI/CD com lint, testes e build Docker
- Favicon SVG personalizado
- Helper de paginacao para todas as APIs
- Modelo `Plano` no schema Prisma
- Ficheiro `.env.example` com todas as variaveis documentadas
- Headers de seguranca HTTP (X-Frame-Options, CSP, etc.)
- Notificacoes Modal com auto-fetch e integracao completa
- CONTRIBUTING.md com guia completo de contribuicao

### Corrigido
- Service Worker nao cacheava endpoints de API dinamicos
- `ignoreBuildErrors: true` removido do next.config.ts
- `reactStrictMode: false` alterado para `true`
- Password minimo aumentado de 6 para 8 caracteres
- Fallback JWT inseguro substituido por erro explicito
- Stripe sem chave real nao falha silenciosamente
- Botao Bell de notificacoes sem handler
- Toaster duplicado (Sonner + Shadcn)
- Import morto `OrganizacaoDashboardView` removido
- Middleware atualizado para nova API de rate-limit
- package-lock.json removido (projeto usa Bun)
- Scripts de desenvolvimento removidos do repositorio
- `LogAcesso.userId` tornado nullable para logins falhados
- Campo duplicado `revelada` removido do schema

### Melhorado
- Dockerfile com utilizador nao-root, healthcheck e copy prisma
- docker-compose.yml com restart, redes e health conditions
- Caddyfile configurado para producao com HTTPS
- rate-limit.ts com configuracoes pre-definidas e documentacao Redis
- tsconfig.json com `noImplicitAny: true` e `strictNullChecks: true`
- package.json autor atualizado

## [3.11.0] - 2025-11-01

### Adicionado
- Raspadinha com motor Canvas e efeito de raspagem real
- Sistema de sorteio SHA-256 auditavel
- Suporte PWA com manifest e service worker
- Integracao Stripe completa com webhooks
- Sistema de notificacoes push (VAPID)
- Dashboard multi-role (super_admin, aldeia_admin, vendedor, jogador)
- Exportacao de relatorios CSV
- API REST completa com documentacao OpenAPI
- Validacao Zod em todos os endpoints
- Sistema de backup automatico
- Logs de acesso e auditoria
- Cookie Banner RGPD

### Corrigido
- Performance da pagina principal (9600 -> 255 linhas)
- Responsividade mobile

## [3.0.0] - 2025-08-01

### Adicionado
- Plataforma multi-tenant completa
- Jogo Poio da Vaca com grelha interativa
- Sistema de Rifas digitais
- Gestao de Aldeias e Eventos
- Autenticacao JWT com roles
- Base de dados Prisma com SQLite/PostgreSQL

## [1.0.0] - 2025-01-01

### Adicionado
- Versao inicial do projeto
- Estrutura base Next.js
- Primeiros componentes UI
