# AldeiasGames - Plano de Execução

## Prioridades de Implementação

### Fase 1: Admin & Organização (Fluxo Core)
- [x] 1.1 Admin: Verificação/Aprovação de Organizações
  - API: `/api/aldeias/[id]/verificar` ✅
  - API: `/api/aldeias/pendentes` ✅
  - UI: `admin-organization-verification.tsx` ✅
- [x] 1.2 Admin: Gestão de Planos SaaS
  - API: `/api/planos/[id]` (PATCH, DELETE) ✅
  - UI: `admin-planos-view.tsx` ✅
- [x] 1.3 Organização: Wizard de Configuração
  - UI: `organizacao-wizard.tsx` ✅
- [x] 1.4 Organização: Gestão de Jogos (CRUD)
  - UI: `organizacao-jogos-view.tsx` ✅
- [x] 1.5 Organização: Gestão de Prémios
  - UI: `organizacao-premios-view.tsx` ✅

### Fase 2: Vendedor & Vendas
- [x] 2.1 Vendedor: Scanner QR Code
  - Componente: `vendedor-scanner.tsx` ✅
  - API: `/api/vendedor/validar-qr` ✅
- [x] 2.2 Vendedor: Comprovativos de Venda
  - API: `/api/vendas`, `/api/vendas/[id]` ✅
  - Componente: `comprovativo-venda.tsx` ✅
- [x] 2.3 Vendedor: Registo de Cliente
  - API: `/api/clientes` ✅
- [x] 2.4 Vendedor: Terminal de Vendas (Tablet/Telemóvel)
  - Componente: `terminal-vendas.tsx` ✅
  - API: `/api/vendas/rapida` ✅
  - Fluxo: Escolher Jogo → Registar Cliente → Pagamento → Confirmação ✅
- [ ] 2.5 Vendedor: Sincronização Online/Offline

### Fase 3: Cliente & Utilizador
- [x] 3.1 Cliente: Perfil do Utilizador
  - API: `/api/users/perfil` ✅
  - Componente: `cliente-perfil.tsx` ✅
- [x] 3.2 Cliente: Notificações (já existe API e UI)
- [x] 3.3 Cliente: Histórico de Prémios
  - API: `/api/premios/historico` ✅
  - Componente: `cliente-historico-premios.tsx` ✅
- [ ] 3.4 Cliente: Carrinho de Compras

### Fase 4: Infraestrutura
- [ ] 4.1 Admin: Logs de Auditoria UI
- [ ] 4.2 Admin: Configurações Globais
- [ ] 4.3 Cliente: Modo PWA Offline
- [ ] 4.4 Organização: Gestão de Membros/Documentos

---

_Atualizado: 2026-03-09_
