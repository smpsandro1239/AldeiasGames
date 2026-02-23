# 📋 TODOLIST - Aldeias Games

> Última atualização: 2026-02-23
> Progresso: 98% (Refatoração Contínua)
> Versão: 3.9.1-dev (Auditoria & Refactor)

---

## 🔴 PRIORIDADE CRÍTICA - Segurança e Arquitetura

### Segurança JWT ✅
- [x] Remover fallback hardcoded da chave JWT em `src/lib/auth.ts`
- [x] Adicionar validação de existência de `JWT_SECRET` no arranque

### Gestão de Base de Dados ✅
- [x] Implementar Singleton Pattern robusto no `src/lib/db.ts` para evitar fugas de conexão

### Refatoração "God Component" (page.tsx) 🏗️
- [x] Extrair tipos para `src/types/project.ts`
- [x] Extrair sub-componentes UI (Skeletons, Modais) para ficheiros separados
- [x] Extrair `ScratchCard` e `RifaNumberSelector`
- [ ] Extrair lógica de estado e chamadas API para hooks customizados (Pendente)
- [🏗️] Reduzir `src/app/page.tsx` (Reduzido em ~800 linhas até agora)

---

## 🟠 PRIORIDADE ALTA - Performance e Robustez

### Otimização de Queries ✅
- [x] Substituir `findMany().find()` por `findFirst()` nativo em `src/app/api/participacoes/route.ts`
- [x] Adicionar índices no schema Prisma para campos de busca frequente (slug, jogoId, userId)

### Validação de Dados ✅
- [x] Implementar **Zod** para validação de payloads nas rotas críticas (Login, Participações)
- [ ] Tipagem rigorosa em todos os retornos de API (Pendente)

---

## 🟡 PRIORIDADE MÉDIA - Funcionalidades e Manutenção

### Sistema de Backups ✅
- [x] Alterar método de cópia direta para `VACUUM INTO` do SQLite para garantir consistência

### Gestão de Media 🏗️
- [ ] Migrar armazenamento de imagens Base64 para Filesystem ou S3-compatible storage

### DevOps & Testes ✅
- [x] Corrigir `jest.config.ts` (erro de importação do Next.js)
- [x] Adicionar polyfills para TextEncoder/Decoder nos testes
- [ ] Implementar testes de integração para fluxos críticos (Login, Participação, Sorteio)

---

## ✅ CONCLUÍDO (Histórico)
- [x] Multi-tenancy (Aldeias/Escolas/Clubes)
- [x] Tipos de Jogos (Poio da Vaca, Rifa, Tombola, Raspadinhas)
- [x] Sistema de Roles completo
- [x] Auditoria de Sorteios
- [x] Exportação PDF/CSV e RGPD

---

## 📊 Resumo de Progresso

| Área | Status |
|------|--------|
| Segurança | 100% ✅ |
| Arquitetura | 85% |
| Performance | 95% |
| Funcionalidades | 100% |

---

**Legenda:**
- [x] Concluído
- [ ] Pendente
- [🏗️] Em curso / Planeado
