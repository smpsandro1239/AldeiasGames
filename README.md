# 🎮 Aldeias Games

> Plataforma SaaS multi-tenant para angariação de fundos através de jogos tradicionais portugueses.

![Progresso](https://img.shields.io/badge/Progresso-100%25-brightgreen)
![Versão](https://img.shields.io/badge/Versão-3.0--dev-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Sobre

**Aldeias Games** é uma plataforma que permite a aldeias e organizações locais angariar fundos através de jogos tradicionais portugueses como:

- 🐄 **Poio da Vaca** - Escolha uma coordenada na grelha
- 🎟️ **Rifa** - Compre números da sorte
- 🎲 **Tombola** - Bilhetes tradicionais

### Características Principais

- ✅ **Multi-tenant** - Cada aldeia tem o seu próprio espaço
- ✅ **Sorteios Transparentes** - Com verificação criptográfica
- ✅ **Dashboard Completo** - Para admins e vendedores
- ✅ **PWA** - Funciona offline
- ✅ **Mobile-First** - Design responsivo
- ✅ **Dark Mode** - Tema claro/escuro
- ✅ **Upload de Imagens** - Base64, sem dependências externas
- ✅ **Backup/Restore** - Sistema completo de backups
- ✅ **Histórico de Pagamentos** - Controlo de gastos para jogadores
- ✅ **Logs de Acesso** - Auditoria de logins
- ✅ **Exportação CSV** - Relatórios completos
- ✅ **RGPD Compliant** - Exportar/apagar dados pessoais
- ✅ **Rate Limiting** - Proteção contra abuso
- ✅ **Anular/Trocar Participações** - Gestão completa de participações
- ✅ **Permissões por Role** - Vendedores só alteram suas vendas
- ✅ **Tipos de Organização** (v3.0) - Aldeias, Escolas, Associações de Pais, Clubes
- ✅ **Sistema de Prémios** (v3.0) - Gestão de prémios por jogo
- ✅ **Conformidade Legal** (v3.0) - Autorizações e alvarás

---

## 🚀 Quick Start

```bash
# Instalar dependências
bun install

# Correr o seed para criar utilizadores de teste
bunx tsx prisma/seed.ts

# Iniciar servidor de desenvolvimento
bun run dev

# Aplicação disponível em http://localhost:3000
```

---

## 🔐 Sistema de Roles

A plataforma possui 4 tipos de utilizadores:

| Role | Descrição |
|------|-----------|
| **Super Admin** | Controlo total da plataforma |
| **Admin Aldeia** | Gestão de uma aldeia específica |
| **Vendedor** | Angariador de fundos |
| **Jogador** | Participante normal |

📖 [Ver documentação completa de roles](./roles.md)

---

## 🧪 Contas de Teste

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@aldeias.pt | 123456 |
| Admin Aldeia | aldeia@gmail.com | 123456 |
| Vendedor | vendedor@gmail.com | 123456 |
| Jogador | smpsandro1239@gmail.com | 123456 |

> ⚠️ **Importante**: Se os logins rápidos não funcionarem, execute `bunx tsx prisma/seed.ts` para criar os utilizadores de teste.

---

## 📊 Progresso do Projeto

| Secção | Progresso |
|--------|-----------|
| Autenticação | 100% ✅ |
| Aldeias | 100% ✅ |
| Eventos | 100% ✅ |
| Jogos | 100% ✅ |
| Participações | 100% ✅ |
| Sorteios | 100% ✅ |
| Billing | 78% |
| Interface | 100% ✅ |
| Auditoria | 100% ✅ |
| Backup | 100% ✅ |
| Pagamentos | 100% ✅ |
| Logs | 100% ✅ |
| RGPD | 100% ✅ |
| **Roles** | **100% ✅** |
| **Total** | **100%** |

📖 [Ver todolist completo](./todolist.md)

---

## 🛠️ Tecnologias

### Core
- **Next.js 16** - Framework React
- **TypeScript** - Type safety
- **Prisma** - ORM
- **SQLite** - Base de dados

### UI/UX
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes
- **Framer Motion** - Animações
- **Lucide** - Ícones
- **next-themes** - Dark mode

### Features
- **JWT Authentication** - Autenticação segura
- **PWA** - Progressive Web App
- **Multi-tenant** - Isolamento de dados
- **Base64 Images** - Upload sem Cloudinary

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/           # API Routes
│   │   ├── auth/      # Autenticação
│   │   ├── aldeias/   # Gestão de aldeias
│   │   ├── eventos/   # Gestão de eventos
│   │   ├── jogos/     # Gestão de jogos
│   │   ├── participacoes/ # Participações
│   │   ├── sorteios/  # Sorteios
│   │   ├── users/     # Gestão de utilizadores
│   │   └── backup/    # Backup/restore
│   ├── page.tsx       # Página principal
│   ├── layout.tsx     # Layout
│   └── globals.css    # Estilos globais
├── components/
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom hooks
└── lib/               # Utilitários
    ├── auth.ts        # Autenticação
    ├── db.ts          # Base de dados
    └── utils.ts       # Helpers
```

---

## 🔧 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro

### Aldeias
- `GET /api/aldeias` - Listar aldeias
- `POST /api/aldeias` - Criar aldeia (super_admin)
- `GET/PATCH/DELETE /api/aldeias/[id]` - CRUD aldeia

### Eventos
- `GET /api/eventos` - Listar eventos
- `POST /api/eventos` - Criar evento (admin)
- `GET/PUT/DELETE /api/eventos/[id]` - CRUD evento

### Jogos
- `GET /api/jogos` - Listar jogos
- `POST /api/jogos` - Criar jogo (admin)
- `GET/PATCH/DELETE /api/jogos/[id]` - CRUD jogo

### Participações
- `GET /api/participacoes` - Listar participações
- `POST /api/participacoes` - Criar participação
- `PUT /api/participacoes/[id]/alterar` - Alterar (admin)
- `GET /api/participacoes/[id]/historico` - Histórico

### Utilizadores
- `GET /api/users` - Listar utilizadores (admin)
- `POST /api/users` - Criar vendedor (admin)
- `GET/PATCH /api/users/perfil` - Perfil próprio

### Backup
- `GET /api/backup` - Listar backups
- `POST /api/backup` - Criar backup
- `POST /api/backup/restore` - Restaurar backup
- `DELETE /api/backup/restore` - Apagar backup

---

## 📋 Funcionalidades Implementadas

### ✅ Completas

- [x] Sistema de autenticação completo
- [x] 4 roles com permissões específicas
- [x] Dashboard do vendedor
- [x] Gestão de vendedores por aldeia
- [x] Quick login para testes
- [x] Sorteios transparentes e verificáveis
- [x] Alteração de participações com auditoria
- [x] Multi-seleção (até 10 participações)
- [x] Pagamento em dinheiro e MBWay
- [x] PWA offline
- [x] Dark mode toggle
- [x] Upload de imagens (base64)
- [x] Sistema de backup/restore
- [x] Edição de perfil
- [x] Histórico de pagamentos detalhado
- [x] Logs de acesso com IP e user agent
- [x] Preferências de notificação
- [x] Exportação de relatórios CSV
- [x] RGPD - Exportar dados pessoais
- [x] RGPD - Apagar conta (direito ao esquecimento)
- [x] Rate limiting para proteção de API

### ⏳ Pendentes (Config Externa)

- [ ] Integração Stripe (requer chave Stripe)
- [ ] Webhook Stripe (requer configuração Stripe)

---

## 📄 Documentação

- [📋 Todolist](./todolist.md) - Progresso detalhado
- [🔐 Roles](./roles.md) - Sistema de permissões

---

## 📝 Licença

MIT License - Veja [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ para as aldeias portuguesas.
