# 📋 TODOLIST - Aldeias Games

> Última atualização: 2026-02-23
> Progresso: 95% (Fase de Estabilização)
> Versão: 3.12.0-stabilization

---

## 🔴 PRIORIDADE CRÍTICA - Estabilização Final

### Refatoração "God Component" (page.tsx) ✅
- [x] Extrair tipos e logic
- [x] Extrair todos os modais complexos para `src/components/modals/`
- [x] Eliminar funções órfãs no fim do ficheiro
- [x] Reduzir `src/app/page.tsx` para ~5.4k linhas (50% do original)

### Gestão de Media ✅
- [x] Implementar sistema de armazenamento local
- [x] Criar script de migração para remover Base64 da BD (`scripts/migrate-images.ts`)

---

## 🟠 PRIORIDADE ALTA - Segurança e Compliance

### Documentação API ✅
- [x] Implementar spec OpenAPI/Swagger inicial
- [x] Rota `GET /api/docs` ativa

### Conformidade Legal ✅
- [x] Gerador de textos legais dinâmicos por organização
- [x] Banner de Cookies/Consentimento para RGPD 2026

---

## 🟡 PRIORIDADE MÉDIA - Funcionalidades e Monetização

### Monetização 🏗️
- [ ] Integração real com Stripe (Pagamentos e Subscrições)
- [ ] Dashboard de faturamento para super_admin

### Real-time 🏗️
- [ ] Implementar WebSockets (Socket.io ou Pusher) para sorteios ao vivo
- [ ] Notificações Push reais

---

## ✅ CONCLUÍDO (Recentemente)
- [x] Rate Limiting Global
- [x] Raspadinha Premium com Confetti
- [x] Índices de Performance BD

---

## 📊 Resumo de Progresso

| Área | Status |
|------|--------|
| Segurança | 100% ✅ |
| Arquitetura | 90% |
| Performance | 100% ✅ |
| Funcionalidades | 95% |

---

**Legenda:**
- [x] Concluído
- [ ] Pendente
- [🏗️] Em curso / Planeado
