# Aldeias Games 2026 - Auditoria e Refatoração Completa

![Aldeias Games](https://lh3.googleusercontent.com/aida/AOfcidVEuLMESyW_JpPysHsIDp5IGL7dC-X1pVe3dCZqxBoOvNb18FrqoLEu3OkadWZethd8S07P8Rp2xBi24ZOr2Imr7qDsstAr-YtK4pYIZd73eSTVUL5Y12xiBYmMv8sh9dKxQtuzkYRAOzJlYwSlv3P52MN0CKtVvGDIxFb0Mqn2p518ewS5MkgNbKIFLa1qfcBmuwJOrkK5AHbn348I7NBKLxx04mC-oIP30VGWaGAmeRK_nxyp8w20I4E)

## 🎯 Objetivos do Projeto
O **Aldeias Games** é uma plataforma SaaS (Software as a Service) desenhada para modernizar a dinamização de eventos e angariação de fundos em aldeias e pequenas comunidades. Através de jogos digitais (Sorteios, Raspadinhas, Poio da Vaca), permite que associações locais aumentem o seu alcance e facilitem a participação dos cidadãos.

## 🚀 Estado Atual: 100% Funcional & Seguro
Após uma intervenção técnica profunda, o projeto passou de um protótipo monolítico para uma aplicação robusta de nível de produção.

### Funcionalidades Implementadas
- **Multi-Role Dashboards:** Vistas específicas para Admin, Organização, Vendedor e Cliente.
- **Ecossistema de Jogos:** Raspadinhas digitais com experiência sonora e visual (confetti).
- **Gestão de Media:** Sistema de upload de ficheiros físico (substituindo Base64 em DB).
- **Segurança Hardened:** Rate limiting, validação Zod, JWT seguro e Prisma Singleton.
- **SaaS Monetização:** Estrutura de planos (Grátis, Pro, Premium) com taxas dinâmicas.
- **Relatórios:** Exportação para Excel e visualização de CRM/Analytics para administradores.
- **Conformidade Legal:** Banner de Cookies e secção de Termos e Condições (2026 EU/PT).

## 🛠️ Stack Tecnológica
- **Framework:** Next.js 14 (App Router)
- **Base de Dados:** SQLite (com Prisma ORM)
- **Estilização:** Tailwind CSS + Lucide React
- **Segurança:** Jose (JWT), Zod (Validation), Express-rate-limit (Logic)
- **Experiência:** Canvas-confetti, Web Audio API

## 📂 Estrutura de Pastas (Refatorada)
\`\`\`text
src/
├── app/                  # Rotas e API (Next.js App Router)
├── components/           # Componentes UI Atómicos
│   ├── modals/           # Modais de Negócio (Auth, Create, Wizard, etc.)
│   └── ui-components.tsx # Componentes base padronizados
├── features/             # Vistas complexas (Dashboards por Role)
├── hooks/                # Lógica de negócio reutilizável (useAuth, useParticipacoes)
├── lib/                  # Utilitários, Auth, DB, Storage e Audio
└── middleware.ts         # Segurança e Rate Limiting global
\`\`\`

## 📸 Screenshots & Mockups

| Página Inicial | Raspadinha Digital |
| :---: | :---: |
| ![Home](https://lh3.googleusercontent.com/aida/AOfcidXAKGDvRMm48Yy0B1JHE35x2Y2KSX_Iwne8CUPXbLDA84BE1JzgIRNPrNE7AKAf3cxKFcPVumje_y5K8hA9grXyuu8xzPvgawISF1OsOu1iGCoFu0LaWDoNwmrwN_t0Fn8GA1H-8xl9AwM1bG5jqsyc9F4Yu1PwFH2bDo2ebRqIfF_61CHfQWNmoovlMNHVHbiXTrwd71vWXzvptFVu1Id3_xlUuGqD2mm_NBMnlT8m88u0c_oqZSpdxQ) | ![Raspadinha](https://lh3.googleusercontent.com/aida/AOfcidUKRNuC9J8-SyuUQFDsvnfGee1nks0CoQrCoBM-uKFAwfk0MjKhUxBT3ETb4EHBTiG18wESrG8CnLsFD_1Viak8-KQxfYHFddW1lLs-x2NiiwTYqP2sK_jkyWI0_LXo0yUFds5OReMsB1Q3HNx55ayGqEK6XHf6SsrFt8k_1o2ghLDO3A7oH5_HFgQhKAS3llpkF4OtzhCcL14yNVlbJwhQ2IgVvpJrG6UK41mV8LKWzXzjltHGYkU_suA) |

| CRM Admin | Checkout MBWay |
| :---: | :---: |
| ![CRM](https://lh3.googleusercontent.com/aida/AOfcidXYQIPSY452xSx5Sljx0JIc2JT2FwIfmO-77wqJdH7wcSK0NSnivsnIZcLaVuz2rGsdl7Ei0D_qPI2Q7C45SEcutQFdkubdp4pk7gJN1ehcjcm43oky3GUgs0xpqAsd3SeAXElQMUTNb5fTTI5zP2wUXzxUQLES2gXeupIJDIKJGujGvCS1_NObjGjblodOsg2ZFMbLWcjGIY6d8veTBepNqgpWOPz1Vp000zcztooRjaVpud-BGAc5HT4) | ![Checkout](https://lh3.googleusercontent.com/aida/AOfcidUHJkmJ6JgdKvUpLo28So1qCBZDSEtVRFKcnmUFf9qlgTr6JzFpuB5sAD8udAU5q6lX2CSOfwtbHkM9TrbCzonT_EFRW68mpaQRSWhWqqu1aLPePEYcmjLeYIEt1DuNwNjzLSESRhar4tgjMmTqDzkNmeo8fE_7CqtvwQ0rET5k0-GlvavfSQGTTPK3SapAHHN5-c0vpryGptG1z-DaoC-LwQgjaK9hYz1-fv0-6nF34e8j1p732F8gJnA) |

## ⚙️ Instalação e Execução
1. **Clone o repositório:** \`git clone ...\`
2. **Instale dependências:** \`npm install\`
3. **Configure o Base de Dados:** \`npx prisma migrate dev\`
4. **Migre imagens (Opcional):** \`npx ts-node scripts/migrate-images.ts\`
5. **Inicie o servidor:** \`npm run dev\`

## 🚧 Problemas Conhecidos & Roadmap
- [ ] **Integração Real Stripe:** Atualmente em modo sandbox/simulação.
- [ ] **WebSockets:** Notificações em tempo real (atualmente via polling).
- [ ] **App Mobile Nativa:** Planeado para Q4 2026.

---
**Auditoria efetuada por Jules (Expert Software Engineer)**
