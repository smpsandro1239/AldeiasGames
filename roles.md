# 🔐 Sistema de Roles - Aldeias Games

> Última atualização: 2025-01-20
> Versão: 3.0-dev

---

## ⚠️ Nota Importante sobre Seeds

Se os logins rápidos não funcionarem, execute o seed para criar os utilizadores de teste:

```bash
bunx tsx prisma/seed.ts
```

Isso criará os 4 utilizadores de teste com as credenciais corretas:
- Super Admin: admin@aldeias.pt / 123456
- Admin Aldeia: aldeia@gmail.com / 123456
- Vendedor: vendedor@gmail.com / 123456
- Jogador: smpsandro1239@gmail.com / 123456

---

## 📋 Visão Geral

O sistema "Aldeias Games" possui **4 tipos de roles** com diferentes níveis de permissão:

| Role | Nome | Descrição |
|------|------|-----------|
| `super_admin` | Super Administrador | Controlo total da plataforma |
| `aldeia_admin` | Administrador de Aldeia | Gestão de uma aldeia específica |
| `vendedor` | Vendedor | Angariador de fundos |
| `user` | Jogador | Participante normal nos jogos |

---

## 👑 Super Admin (`super_admin`)

### Descrição
Administrador global da plataforma com acesso total a todas as funcionalidades.

### Permissões Implementadas ✅

#### Aldeias
- [✅] Ver todas as aldeias
- [✅] Criar novas aldeias
- [✅] Editar informações de qualquer aldeia
- [✅] Apagar aldeias
- [✅] Atribuir administradores a aldeias
- [✅] Upload de logo da aldeia (base64)

#### Eventos
- [✅] Ver todos os eventos (todas as aldeias)
- [✅] Criar eventos em qualquer aldeia
- [✅] Editar eventos
- [✅] Apagar eventos
- [✅] Upload de imagem do evento (base64)

#### Jogos
- [✅] Ver todos os jogos
- [✅] Criar jogos em qualquer evento
- [✅] Editar estado dos jogos (abrir/fechar)
- [✅] Apagar jogos

#### Sorteios
- [✅] Executar sorteios
- [✅] Ver resultados de todos os sorteios
- [✅] Aceder à página de auditoria

#### Participações
- [✅] Ver todas as participações
- [✅] Alterar participações (com registo de auditoria)
- [✅] Ver histórico de alterações
- [✅] Registar participações para clientes externos
- [✅] Usar pagamento em dinheiro

#### Faturação
- [✅] Ver dashboard administrativo
- [✅] Ver métricas globais
- [✅] Gestão de planos

#### Gestão de Utilizadores
- [✅] Ver todos os utilizadores
- [✅] Criar vendedores para qualquer aldeia

#### Backup & Sistema
- [✅] Listar backups
- [✅] Criar backups
- [✅] Restaurar backups
- [✅] Apagar backups

#### Segurança & Auditoria
- [✅] Ver logs de acesso
- [✅] Exportar relatórios CSV (todos os dados)

### Permissões Pendentes (Requer Config Externa) ⏳

- [ ] Integração Stripe
- [ ] Ver histórico de pagamentos Stripe

---

## 🏘️ Admin Aldeia (`aldeia_admin`)

### Descrição
Administrador responsável por uma aldeia específica. Só pode gerir recursos da sua aldeia.

### Permissões Implementadas ✅

#### Aldeia Própria
- [✅] Ver informações da sua aldeia
- [✅] Editar informações básicas da sua aldeia
- [✅] Upload de logo da aldeia (base64)
- [❌] Criar aldeias (apenas super_admin)
- [❌] Apagar aldeia

#### Eventos
- [✅] Ver eventos da sua aldeia
- [✅] Criar eventos na sua aldeia
- [✅] Editar eventos da sua aldeia
- [✅] Apagar eventos da sua aldeia
- [✅] Upload de imagem do evento (base64)

#### Jogos
- [✅] Ver jogos da sua aldeia
- [✅] Criar jogos nos eventos da sua aldeia
- [✅] Editar estado dos jogos
- [✅] Apagar jogos da sua aldeia

#### Sorteios
- [✅] Executar sorteios nos jogos da sua aldeia
- [✅] Ver resultados dos sorteios da sua aldeia

#### Participações
- [✅] Ver participações da sua aldeia
- [✅] Alterar participações da sua aldeia (com auditoria)
- [✅] Ver histórico de alterações
- [✅] Registar participações para clientes externos
- [✅] Usar pagamento em dinheiro

#### Dashboard
- [✅] Aceder ao painel administrativo
- [✅] Ver métricas da sua aldeia

#### Gestão de Vendedores
- [✅] Ver vendedores da sua aldeia
- [✅] Criar novos vendedores para a sua aldeia

#### Relatórios
- [✅] Exportar CSV de participações (sua aldeia)
- [✅] Exportar CSV de vendedores (sua aldeia)
- [✅] Exportar CSV de eventos (sua aldeia)

### Permissões Pendentes (Requer Config Externa) ⏳

- [ ] Ver histórico de pagamentos da aldeia

### Restrições ❌

- Não pode ver aldeias de outros administradores
- Não pode criar/apagar aldeias
- Não pode aceder a métricas globais
- Não pode alterar participações de outras aldeias
- Não pode gerir backups (apenas super_admin)
- Não pode ver logs de acesso (apenas super_admin)

---

## 💼 Vendedor (`vendedor`)

### Descrição
Angariador de fundos que trabalha para uma aldeia. Regista participações em nome de clientes locais.

### Estado Atual
✅ **COMPLETO** - Todas as funcionalidades implementadas.

### Permissões Implementadas ✅

#### Autenticação e Acesso
- [✅] Fazer login
- [✅] Ver jogos públicos ativos
- [✅] Participar em jogos (como jogador normal)
- [✅] Editar perfil próprio (nome, telefone)
- [✅] Toggle dark mode
- [✅] Preferências de notificação

#### Registo de Participações
- [✅] Registar participações para clientes externos
- [✅] Usar pagamento em dinheiro
- [✅] Identificação do cliente (nome, telemóvel, email)

#### Visualização
- [✅] Ver grelha de posições ocupadas
- [✅] Ver quem jogou em cada posição (clicando na posição)

#### Dashboard Próprio
- [✅] Dashboard de vendedor separado
- [✅] Ver vendas realizadas por si
- [✅] Total angariado pessoalmente
- [✅] Número de participações registadas
- [✅] Métricas de vendas (hoje, total, valor)
- [✅] Lista de últimas vendas

#### Histórico
- [✅] Histórico de pagamentos pessoal
- [✅] RGPD - Exportar dados pessoais
- [✅] RGPD - Apagar conta (direito ao esquecimento)

### Restrições ❌

- Não pode criar/editar/apagar eventos
- Não pode criar/editar/apagar jogos
- Não pode executar sorteios
- Não pode alterar participações
- Não pode usar dashboard de admin
- Não pode criar/editar/apagar aldeias
- Não pode criar novos vendedores
- Não pode gerir backups
- Não pode ver logs de acesso

---

## 🎮 Jogador (`user`)

### Descrição
Participante normal nos jogos. Pode comprar participações e ver os seus jogos.

### Permissões Implementadas ✅

#### Autenticação
- [✅] Registar-se (nome, email, password)
- [✅] Fazer login
- [✅] Recuperar password
- [✅] Fazer logout
- [✅] Editar perfil (nome, telefone)
- [✅] Toggle dark mode
- [✅] Preferências de notificação

#### Jogos
- [✅] Ver lista de jogos públicos ativos
- [✅] Ver detalhes dos jogos
- [✅] Ver grelha de posições (disponíveis/ocupadas)
- [✅] Participar em jogos (até 10 de uma vez)
- [✅] Seleção múltipla de números/coordenadas

#### Pagamentos
- [✅] Pagar com MBWay (única opção)
- [❌] Pagamento em dinheiro (apenas admins/vendedores)

#### Participações
- [✅] Ver suas participações
- [✅] Ver se ganhou (após sorteio)
- [✅] Ver resultado do sorteio

#### Histórico
- [✅] Histórico de pagamentos detalhado
- [✅] Estatísticas de gastos e vitórias
- [✅] RGPD - Exportar dados pessoais
- [✅] RGPD - Apagar conta (direito ao esquecimento)

### Permissões Pendentes ⏳

- [ ] Receber notificações por email (opt-in implementado, envio depende de serviço)

### Restrições ❌

- Não pode pagar em dinheiro
- Não pode registar participações para terceiros
- Não pode ver participações de outros jogadores
- Não pode aceder ao painel administrativo
- Não pode criar/editar/apagar eventos, jogos ou aldeias

---

## 📊 Matriz de Permissões

| Ação | Super Admin | Admin Aldeia | Vendedor | Jogador |
|------|:-----------:|:------------:|:--------:|:-------:|
| Ver todas as aldeias | ✅ | ❌ | ❌ | ❌ |
| Criar aldeias | ✅ | ❌ | ❌ | ❌ |
| Editar qualquer aldeia | ✅ | ❌ | ❌ | ❌ |
| Editar sua aldeia | ✅ | ✅ | ❌ | ❌ |
| Ver todos os eventos | ✅ | ❌ | ❌ | ❌ |
| Ver eventos da aldeia | ✅ | ✅ | ✅ | ✅* |
| Criar eventos | ✅ | ✅ | ❌ | ❌ |
| Ver todos os jogos | ✅ | ❌ | ❌ | ❌ |
| Ver jogos da aldeia | ✅ | ✅ | ✅ | ✅ |
| Criar jogos | ✅ | ✅ | ❌ | ❌ |
| Executar sorteios | ✅ | ✅ | ❌ | ❌ |
| Ver todas as participações | ✅ | ❌ | ❌ | ❌ |
| Ver participações da aldeia | ✅ | ✅ | ❌ | ❌ |
| Ver suas participações | ✅ | ✅ | ✅ | ✅ |
| Alterar participações | ✅ | ✅ | ❌ | ❌ |
| Registar para cliente | ✅ | ✅ | ✅ | ❌ |
| Pagamento em dinheiro | ✅ | ✅ | ✅ | ❌ |
| Pagamento MBWay | ✅ | ✅ | ✅ | ✅ |
| Dashboard admin | ✅ | ✅ | ❌ | ❌ |
| Dashboard vendedor | ❌ | ❌ | ✅ | ❌ |
| Ver posições ocupadas | ✅ | ✅ | ✅ | ✅ |
| Ver quem jogou | ✅ | ✅ | ✅ | ❌ |
| Criar vendedores | ✅ | ✅ | ❌ | ❌ |
| Ver vendedores | ✅ | ✅ | ❌ | ❌ |
| Gerir backups | ✅ | ❌ | ❌ | ❌ |
| Ver logs de acesso | ✅ | ❌ | ❌ | ❌ |
| Exportar CSV (todos) | ✅ | ❌ | ❌ | ❌ |
| Exportar CSV (aldeia) | ✅ | ✅ | ❌ | ❌ |
| Histórico pagamentos próprio | ✅ | ✅ | ✅ | ✅ |
| Editar perfil próprio | ✅ | ✅ | ✅ | ✅ |
| Dark mode toggle | ✅ | ✅ | ✅ | ✅ |
| Preferências de notificação | ✅ | ✅ | ✅ | ✅ |
| RGPD - Exportar dados | ❌ | ❌ | ✅ | ✅ |
| RGPD - Apagar conta | ❌ | ❌ | ✅ | ✅ |

**Legenda:**
- ✅ = Implementado e funcional
- ❌ = Não permitido / Não aplicável
- ✅* = Apenas jogos públicos ativos

---

## 🔧 Implementação Técnica

### Backend (API)

```typescript
// Verificação de permissões nos endpoints
const user = await getUserFromRequest(request);

// Super Admin apenas
if (user?.role !== 'super_admin') {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
}

// Super Admin ou Admin Aldeia
if (!['super_admin', 'aldeia_admin'].includes(user.role)) {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
}

// Vendedor, Admin Aldeia ou Super Admin
if (!['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role)) {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
}

// Filtrar por aldeia (para Admin Aldeia)
if (user.role === 'aldeia_admin' && user.aldeiaId !== recursoAldeiaId) {
  return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
}
```

### Frontend (React)

```typescript
// Verificação de permissões no componente
const isAdmin = user && ['super_admin', 'aldeia_admin'].includes(user.role);
const isSuperAdmin = user?.role === 'super_admin';
const isVendedor = user?.role === 'vendedor';
const canManageGame = user && ['super_admin', 'aldeia_admin'].includes(user.role);
const canUseCash = user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role);

// Renderização condicional
{isAdmin && <Button onClick={handleSorteio}>Sortear</Button>}
{isSuperAdmin && <Button onClick={openCreateAldeia}>Nova Aldeia</Button>}
{isVendedor && <Button onClick={() => setActiveView('vendedor')}>Vendas</Button>}
{isSuperAdmin && <TabsTrigger value="backups">Backups</TabsTrigger>}
{isSuperAdmin && <TabsTrigger value="logs">Logs</TabsTrigger>}
```

---

## 🧪 Contas de Teste

| Role | Email | Password | Aldeia |
|------|-------|----------|--------|
| Super Admin | admin@aldeias.pt | 123456 | Todas |
| Admin Aldeia | aldeia@gmail.com | 123456 | Vila Verde |
| Vendedor | vendedor@gmail.com | 123456 | Vila Verde |
| Jogador | smpsandro1239@gmail.com | 123456 | - |

---

## 📝 Novas Funcionalidades (v1.3)

### Dashboard do Vendedor
- **Localização**: Botão "Vendas" no header (apenas visível para vendedor)
- **Métricas**: Total angariado, vendas hoje, total de vendas
- **Lista de Vendas**: Últimas 20 vendas registadas pelo vendedor
- **Ações Rápidas**: Ver jogos, ver participações

### Gestão de Vendedores
- **Localização**: Tab "Vendedores" no painel administrativo
- **Criar Vendedor**: Modal com nome, email, password
- **Permissões**: Admin Aldeia pode criar vendedores para a sua aldeia
- **Lista**: Todos os vendedores da aldeia com data de criação

### Quick Login
- **Localização**: Modal de login (modo teste)
- **Botões**: 4 botões para login rápido (Super Admin, Admin Aldeia, Vendedor, Jogador)
- **Credenciais**: Preenchidas automaticamente

### Backup Management
- **Localização**: Tab "Backups" no painel administrativo (apenas super_admin)
- **Funcionalidades**: Listar, criar, restaurar e apagar backups
- **Segurança**: Confirmação antes de restaurar/apagar

### Upload de Imagens
- **Localização**: Formulários de criação de aldeia e evento
- **Formato**: Base64 (não requer Cloudinary/S3)
- **Validação**: Max 5MB, apenas imagens
- **Preview**: Visualização antes de salvar

### Dark Mode
- **Localização**: Botão Lua/Sol no header
- **Persistência**: Automática via localStorage
- **Suporte**: Todas as páginas e componentes

### Edição de Perfil
- **Localização**: Botão "Perfil" no header (quando logado)
- **Campos**: Nome, telefone, preferências de notificação
- **API**: GET/PATCH `/api/users/perfil`

### Histórico de Pagamentos
- **Localização**: Botão "Histórico" no header (quando logado)
- **Estatísticas**: Total gasto, participações, vitórias
- **API**: GET `/api/users/historico-pagamentos`

### Logs de Acesso
- **Localização**: Tab "Logs" no painel administrativo (apenas super_admin)
- **Informações**: Data/hora, IP, user agent, sucesso/falha
- **API**: GET `/api/logs-acesso`

### Exportação CSV
- **Localização**: Botão "Exportar CSV" no painel admin
- **Tipos**: Participações, vendedores, eventos
- **API**: GET `/api/export?tipo=...`

---

## 🔒 Considerações de Segurança

- Todas as verificações de permissão são feitas no backend
- O frontend apenas esconde UI não autorizada (não é garantia de segurança)
- JWT tokens expiram em 7 dias
- Alterações de participações ficam registadas com IP e motivo
- Filtragem por aldeiaId garante isolamento de dados
- Backups apenas acessíveis por super_admin
- Confirmação antes de ações destrutivas (restore/delete backup)
- Logs de acesso registam todos os logins (sucesso e falha)
- Exportação de dados filtrada por permissões

---

*Documento atualizado automaticamente pelo sistema de desenvolvimento.*
