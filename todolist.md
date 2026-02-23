# 📋 TODOLIST - Aldeias Games

> Última atualização: 2026-02-23
> Progresso: 90% (Refatoração de Modais concluída)
> Versão: 3.11.0-refactor-modals

---

## 🔴 PRIORIDADE CRÍTICA - Refatoração Final

### Refatoração "God Component" (page.tsx) ✅
- [x] Extrair tipos para `src/types/project.ts`
- [x] Extrair sub-componentes UI básicos
- [x] Extrair `AuthModal`, `ParticiparModal`, `CreateModal`, `WizardModal`
- [ ] Mover modais de Detalhe e Perfil para ficheiros separados (Pendente)
- [🏗️] Reduzir `src/app/page.tsx` para menos de 2000 linhas (Atualmente ~6.5k)

---

## 🟠 PRIORIDADE ALTA - Segurança e UX

### Segurança: Rate Limiting ✅
- [x] Implementar Middleware global de Rate Limiting (`src/middleware.ts`)
- [x] Configurar regras para Login/Registo e API Pesadas

### Imersão: Raspadinha v2 ✅
- [x] Efeitos de Confetti ao ganhar (`canvas-confetti`)
- [x] Feedback visual de raspagem melhorado (Gold/Bronze gradient)
- [ ] Adicionar efeitos sonoros (Web Audio API)

---

## 🟡 PRIORIDADE MÉDIA - Funcionalidades e Escala

### Gestão de Media 🏗️
- [x] Sistema de armazenamento local (`src/lib/storage.ts`)
- [ ] Script para migrar imagens Base64 antigas para ficheiros (Pendente)

### DevOps & Monetização 🏗️
- [ ] Integração real com Stripe (Pagamentos e Subscrições)
- [ ] Documentação OpenAPI/Swagger (Setup inicial pendente)
- [ ] Implementar notificações Push (Web Push API)

---

## ✅ CONCLUÍDO (Recentemente)
- [x] Singleton do PrismaClient
- [x] Validação Zod em rotas críticas
- [x] Índices na BD SQLite
- [x] Componente `FundingGoal`

---

## 📊 Resumo de Progresso

| Área | Status |
|------|--------|
| Segurança | 100% ✅ |
| Arquitetura | 85% |
| Performance | 95% |
| Funcionalidades | 95% |

---

**Legenda:**
- [x] Concluído
- [ ] Pendente
- [🏗️] Em curso / Planeado
