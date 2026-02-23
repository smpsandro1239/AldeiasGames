# 📋 TODOLIST - Aldeias Games

> Última atualização: 2025-01-20
> Progresso: 100%
> Versão: 3.8.1-dev (bugfix)

---

## 🔴 PRIORIDADE ALTA - Expansão v3.0 (Escolas/Associações)

### FASE 1: Tipos de Organização ✅ CONCLUÍDO
- [x] Campos tipoOrganizacao, slug, nomeEscola, etc. no schema
- [x] API atualizada para suportar novos campos
- [x] UI adaptativa com formulários condicionais
- [x] Cards com ícones/cores por tipo de organização

### FASE 2: Sistema de Prémios ✅ CONCLUÍDO
- [x] Criar modelo Premio no schema
- [x] Adicionar premioId ao modelo Jogo
- [x] API GET /api/premios - Listar prémios
- [x] API POST /api/premios - Criar prémio
- [x] API GET/PATCH/DELETE /api/premios/[id]
- [x] Tab "Prémios" no painel admin
- [x] Modal de criação/edição de prémios
- [x] **Seleção de prémio na criação de jogos** ✅
- [x] **Exibição de prémios na página do jogo** ✅

### FASE 3: Conformidade Legal ✅ CONCLUÍDO
- [x] Campos autorizacaoCM, dataAutorizacaoCM no schema
- [x] Campo documentoAutorizacao (PDF base64)
- [x] Campo numeroAlvara no schema
- [x] Checkbox de autorização CM na UI
- [x] Upload de documento PDF na UI
- [x] Campo número de alvará na UI
- [x] **Aviso legal nas rifas/jogos** ✅
- [x] **Texto de conformidade automático** ✅

### FASE 4: Visualizações Públicas ✅ CONCLUÍDO
- [x] **Modal de detalhes da organização** ✅
- [x] **Modal de detalhes da campanha/evento** ✅
- [x] **Barra de progresso de angariação** ✅
- [x] **Lista de prémios visível publicamente** ✅
- [x] **Contador de participantes** ✅
- [x] **Partilha em redes sociais** ✅
- [x] **QR Code único por campanha** ✅

### FASE 5: Onboarding Específico ✅ CONCLUÍDO
- [x] **Escolha do tipo de organização no registo** ✅
- [x] **Wizard de configuração inicial** ✅
- [x] **Upload de logo no registo** ✅

### FASE 6: Dashboard Específico ✅ CONCLUÍDO
- [x] **Dashboard com estatísticas gerais** ✅
- [x] **Evolução mensal (gráfico de barras)** ✅
- [x] **Ranking de vendedores** ✅
- [x] **Dashboard específico para escolas** ✅
- [x] **Dashboard específico para clubes** ✅
- [x] **Cards de estatísticas por tipo** ✅
- [x] **Exportação para relatórios PDF** ✅

---

## 🟡 PRIORIDADE MÉDIA - Melhorias de UX

### Exportação e Relatórios
- [x] Exportação para relatórios PDF ✅
- [x] Comparativo ano a ano ✅
- [x] Gráficos detalhados por evento ✅

---

## 🟢 PRIORIDADE BAIXA - Integrações Externas

### Billing & Pagamentos
- [ ] **Integração Stripe para pagamentos de subscrição** ⏸️ (pendente - requer chave API)
- [ ] Webhook Stripe para atualização de limites
- [ ] Redis para Rate Limiting (produção)

### Expansão
- [x] Página pública /aldeia/[slug] (marketing) ✅
- [x] Notificações in-app ✅
- [ ] API para app móvel nativa
- [ ] Notificações push nativas (FCM)

---

## ✅ CONCLUÍDO - Base do Sistema

### Autenticação e Perfis
- [x] Criar conta normal (email + password)
- [x] Super-admin criar contas aldeia_admin
- [x] Filtragem de dados por aldeiaId
- [x] Logout funcional com token blacklist
- [x] Recuperação de password
- [x] Sistema de roles (user, vendedor, aldeia_admin, super_admin)
- [x] Logs de acesso com IP

### Gestão de Organizações
- [x] Super-admin cria/edita/apaga organizações
- [x] Tipos de organização (aldeia, escola, associacao_pais, clube)
- [x] Campos específicos para escolas
- [x] Endereço completo
- [x] Upload de logo (base64)

### Eventos
- [x] Admin cria/edita/apaga eventos
- [x] Estados: agendado → ativo → terminado
- [x] Upload de imagem (base64)
- [x] Meta de angariação

### Jogos
- [x] Admin cria jogos em eventos ativos
- [x] Poio da Vaca com grelha configurável
- [x] Rifa com total de bilhetes configurável
- [x] Tombola
- [x] Estados: ativo → fechado → sorteado

### Participações
- [x] Multi-seleção (até 10 participações)
- [x] Bloqueio imediato de posição
- [x] Admin registar para cliente local
- [x] Alteração de participações (trocar/anular)
- [x] Permissões por role nas alterações
- [x] Auditoria de alterações

### Sorteios
- [x] Admin executa sorteio
- [x] Seed, hash, resultado visíveis
- [x] Página de auditoria pública
- [x] Botão "Verificar" para validar

### Interface
- [x] Design mobile-first
- [x] Dark mode toggle
- [x] Cores do grid diferenciadas
- [x] Modais animados
- [x] Toast notifications

### Auditoria e Segurança
- [x] Logs de acesso
- [x] Rate limiting
- [x] Backup/restore
- [x] Exportação CSV

### RGPD
- [x] Exportar dados pessoais (JSON)
- [x] Apagar conta (direito ao esquecimento)

---

## 🎯 Próximas Tarefas (Ordem de Execução)

1. [ ] **Testes unitários (Jest + Testing Library)** ← ATUAL
2. [ ] Documentação da API (OpenAPI/Swagger)
3. [ ] Validação de inputs com Zod
4. [ ] Otimização de queries Prisma
5. [ ] API para app móvel nativa (requer planeamento)
6. [ ] Notificações push nativas (FCM) - requer Firebase
7. [ ] Integração Stripe ⏸️ (pendente - requer chave API)

---

## 🆕 Melhorias Detectadas Automaticamente

### Testes (ALTA PRIORIDADE)
- [x] Configurar Jest + Testing Library ✅
- [ ] Testes unitários para funções utilitárias
- [ ] Testes de integração para APIs
- [ ] Testes de componentes React
- [ ] Cobertura de testes > 80%

### Documentação (ALTA PRIORIDADE)
- [ ] Documentação OpenAPI/Swagger para APIs
- [ ] README atualizado com exemplos
- [ ] Diagrama de arquitetura
- [ ] Guia de contribuição

### Segurança (MÉDIA PRIORIDADE)
- [ ] Validação de inputs com Zod
- [ ] Rate limiting melhorado
- [ ] Logs de segurança detalhados
- [ ] Headers de segurança HTTP

### Performance (MÉDIA PRIORIDADE)
- [ ] Índices na base de dados
- [ ] Cache de queries frequentes
- [ ] Lazy loading de componentes
- [ ] Otimização de imagens

---

## 📊 Resumo de Progresso

| Área | Status |
|------|--------|
| Base do Sistema | 100% ✅ |
| FASE 1 (Tipos Organização) | 100% ✅ |
| FASE 2 (Prémios) | 100% ✅ |
| FASE 3 (Conformidade) | 100% ✅ |
| FASE 4 (Visualizações Públicas) | 100% ✅ |
| FASE 5 (Onboarding) | 100% ✅ |
| FASE 6 (Dashboard Específico) | 100% ✅ |
| Exportação PDF | 100% ✅ |

---

## 🧪 Credenciais de Teste

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@aldeias.pt | 123456 |
| Admin Aldeia | aldeia@gmail.com | 123456 |
| Vendedor | vendedor@gmail.com | 123456 |
| Jogador | smpsandro1239@gmail.com | 123456 |

---

**Legenda:**
- [x] Concluído
- [ ] Pendente
