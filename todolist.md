# 📋 TODOLIST - Aldeias Games

> Última atualização: 2026-02-23
> Progresso: 85% (Qualidade de Código)
> Versão: 3.10.0-refactor

---

## 🔴 PRIORIDADE CRÍTICA - Refatoração e Segurança

### Refatoração "God Component" (page.tsx) 🏗️
- [x] Extrair tipos para `src/types/project.ts`
- [x] Extrair sub-componentes UI (Skeletons, Modais)
- [x] Extrair `ScratchCard` e `RifaNumberSelector`
- [x] Extrair logic para `useAuthLogic` e `useDashboardData`
- [x] Extrair `AdminDashboardView`, `VendedorDashboardView`, `PublicGamesView`, `PlayerParticipationsView`
- [ ] Mover modais complexos para ficheiros separados (Pendente)
- [🏗️] Reduzir `src/app/page.tsx` (Reduzido em ~2.3k linhas)

### Gestão de Media ✅
- [x] Implementar sistema de armazenamento local (`src/lib/storage.ts`)
- [x] Migrar `Aldeias`, `Eventos` e `Prémios` de Base64 para `imageUrl`
- [ ] Script de migração para imagens existentes (Pendente)

---

## 🟠 PRIORIDADE ALTA - Performance e Validação

### Validação de Dados ✅
- [x] Criar schemas Zod em `src/lib/validations.ts`
- [x] Implementar validação em todas as rotas críticas (Login, Aldeias, Eventos, Jogos, Participações)

### Performance de Queries ✅
- [x] Substituir filtragem em memória por queries nativas
- [x] Adicionar índices no schema Prisma (Slug, UserId, JogoId)

---

## 🟡 PRIORIDADE MÉDIA - Funcionalidades e UX

### Feature Parity (2026) 🏗️
- [x] Componente `FundingGoal` (Barra de progresso de angariação)
- [ ] Som e animações avançadas na Raspadinha (Pendente)
- [ ] Integração real com Stripe (Pendente)

### DevOps & Documentação 🏗️
- [x] Corrigir configuração de Jest e Testes
- [ ] Criar documentação OpenAPI/Swagger
- [ ] Implementar middleware para Rate Limiting global

---

## ✅ CONCLUÍDO (Histórico)
- [x] Multi-tenancy completo
- [x] Sistema de Roles (4 níveis)
- [x] Auditoria de Sorteios (Seed/Hash)
- [x] Exportação PDF/CSV e conformidade RGPD inicial
- [x] Backups atómicos com `VACUUM INTO`

---

## 📊 Resumo de Progresso

| Área | Status |
|------|--------|
| Segurança | 100% ✅ |
| Arquitetura | 60% |
| Performance | 95% |
| Funcionalidades | 90% |

---

**Legenda:**
- [x] Concluído
- [ ] Pendente
- [🏗️] Em curso / Planeado
