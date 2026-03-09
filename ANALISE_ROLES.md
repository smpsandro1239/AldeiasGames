# Análise Completa - AldeiasGames

## 📋 Roles do Sistema

| Role | View | Descrição |
|------|------|-----------|
| **super_admin** | AdminDashboardView + CRMAdminView | Gestão global da plataforma |
| **aldeia_admin** | OrganizacaoDashboardView | Gestão de uma organização (aldeia/escola/clube) |
| **vendedor** | VendedorDashboardView | Vendas de rifas/raspadinhas |
| **user/cliente** | ClienteDashboardView | Jogador final |

---

## 1. ADMIN (super_admin)

### ✅ Funcionalidades Existentes:
- Dashboard com estatísticas globais (volume, organizações, eventos, utilizadores)
- Lista de organizações
- Lista de eventos críticos
- Botões de exportar relatórios
- CRM de utilizadores (lista, procurar, filtrar)
- Gráfico de volume de vendas

### ❌ Funcionalidades em Falta ou Incompletas:

| Funcionalidade | Status | Notas |
|----------------|--------|-------|
| Gestão de Planos (Planos SaaS) | ❌ | Existe schema mas sem UI |
| Gestão de Super Admins | ❌ | Não há criação de outros admins |
| Configurações Globais | ❌ | Sem view de settings |
| Logs de Auditoria | ⚠️ | Schema existe, sem UI |
|Gestão de Prémios Globais | ❌ | Sem UI para gerir |
| Verificação de Organizações | ❌ | Sem fluxo de aprovação |
| Stripe Admin/Analytics | ❌ | Sem painel de pagamentos |

### 🔄 Melhorias Sugeridas:
1. Adicionar gestão de planos e subscrições
2. Adicionar painel de approval de organizações
3. Adicionar logs de auditoria visuais
4. Adicionar configurações globais (taxas, limites)

---

## 2. ORGANIZAÇÃO (aldeia_admin)

### ✅ Funcionalidades Existentes:
- Dashboard com estatísticas (eventos, angariado, participantes, prémios)
- Lista de eventos da organização
- Criar novo evento
- Download de relatórios

### ❌ Funcionalidades em Falta ou Incompletas:

| Funcionalidade | Status | Notas |
|----------------|--------|-------|
| Criar/Editar Organização | ❌ | Sem wizard de configuração |
| Gestão de Jogos (CRIAR) | ❌ | Só lista, não cria |
| Gestão de Prémios | ❌ | Sem UI |
| Configurações da Organização | ❌ | Sem settings |
| Upload de Documentos Legais | ❌ | Alvará, autorização CM |
| Membros/Equipa | ❌ | Sem gestão de vendedores |
| Templates de Jogos | ❌ | Sem biblioteca de jogos |
| Relatórios Detalhados | ⚠️ | Só existe botão |

### 🔄 Melhorias Sugeridas:
1. Completar wizard de criação de organização
2. Adicionar gestão de jogos (criar/editar)
3. Adicionar gestão de prémios
4. Adicionar painel de documentos legais
5. Adicionar gestão de membros (vendedores)

---

## 3. VENDEDOR (vendedor)

### ✅ Funcionalidades Existentes:
- Terminal de vendas
- Lista de jogos disponíveis por evento
- Venda direta (botão)
- Histórico de vendas
- Estatísticas (vendas hoje, clientes, comissão)

### ❌ Funcionalidades em Falta ou Incompletas:

| Funcionalidade | Status | Notas |
|----------------|--------|-------|
| Scan de QR Code | ❌ | Não há funcionalidadede scan |
| Venda Offline | ❌ | Sem modo offline |
| Registo de Cliente | ❌ | Sem captura de dados do cliente |
| Comprovativo de Venda | ❌ | Sem geração de recibo |
| Sincronização com Backend | ⚠️ | Precisa de API completa |
| QR Code de pagamento MBWay | ❌ | Sem geração de QR |

### 🔄 Melhorias Sugeridas:
1. Adicionar scanner de QR code
2. Adicionar modo offline com sync
3. Adicionar geração de comprovativos
4. Adicionar registo rápido de cliente

---

## 4. CLIENTE (user)

### ✅ Funcionalidades Existentes:
- Dashboard pessoal
- Explorar eventos/jogos
- Participar em jogos
- Revelar raspadinhas (com animação)
- Histórico de participações

### ❌ Funcionalidades em Falta ou Incompletas:

| Funcionalidade | Status | Notas |
|----------------|--------|-------|
| Perfil do Utilizador | ❌ | Sem gestão de perfil |
| Histórico de Prémios | ⚠️ | Parcial |
| Notificações | ❌ | Sem UI de notificações |
| Carrinho de Compras | ❌ | Compra única |
| Métodos de Pagamento | ❌ | Só MBWay implícito |
| Promoções/Cupões | ❌ | Sem sistema |
| Modo Offline (PWA) | ❌ |声称 mas não implementado |
| Preferências (notificações) | ❌ | Sem UI |

### 🔄 Melhorias Sugeridas:
1. Completar perfil do utilizador
2. Adicionar sistema de notificações
3. Adicionar carrinho de compras
4. Adicionar sistema de cupões
5. Completar modo PWA offline

---

## 📊 Resumo de worktodo

### Prioridade Alta (Core):
- [ ] Admin: Gestão de organizações + aprovação
- [ ] Organização: Gestão de jogos e prémios
- [ ] Vendedor: Scanner QR + comprovativos
- [ ] Cliente: Perfil + notificações

### Prioridade Média:
- [ ] Admin: Logs de auditoria + configurações
- [ ] Organização: Membros + documentos legais
- [ ] Vendedor: Modo offline
- [ ] Cliente: Carrinho + cupões

### Prioridade Baixa:
- [ ] Admin: Painel Stripe
- [ ] Organização: Templates
- [ ] Vendedor: Analytics
- [ ] Cliente: Modo PWA completo

---

_Análise gerada em 2026-03-09_
