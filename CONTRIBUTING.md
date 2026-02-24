# Guia de Contribuicao - Aldeias Games

Obrigado pelo interesse em contribuir para o Aldeias Games! Este guia explica como participar no desenvolvimento.

## Codigo de Conduta

Este projeto adota um ambiente respeitoso e inclusivo. Qualquer forma de descriminacao ou assedio sera tolerada.

## Como Contribuir

### Reportar Bugs

1. Verifica se o bug ja foi reportado nos [Issues](../../issues)
2. Cria um novo Issue com:
   - Descricao clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs. observado
   - Screenshots se aplicavel
   - Versao do Node.js/Bun e sistema operativo

### Sugerir Funcionalidades

1. Abre um Issue com o label `enhancement`
2. Descreve o problema que resolve
3. Propoe a solucao
4. Aguarda aprovacao antes de implementar

### Submeter Pull Requests

1. Fork do repositorio
2. Cria uma branch descritiva:
   ```bash
   git checkout -b feat/nome-da-funcionalidade
   # ou
   git checkout -b fix/descricao-do-bug
   ```
3. Implementa as alteracoes
4. Garante que os testes passam:
   ```bash
   bun test
   bunx tsc --noEmit
   bun run lint
   ```
5. Faz commit com mensagens claras (ver Convencoes abaixo)
6. Abre um Pull Request para a branch `develop`

## Convencoes de Codigo

### Mensagens de Commit

Seguimos o padrao [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(modulo): adicionar nova funcionalidade
fix(modulo): corrigir bug especifico
docs(readme): atualizar instrucoes de instalacao
style(ui): melhorar aparencia do botao
refactor(api): simplificar logica de autenticacao
test(auth): adicionar testes de login
chore(deps): atualizar dependencias
```

### Codigo TypeScript

- Usa tipos explícitos sempre que possivel
- Evita `any` - usa tipos proprios ou `unknown`
- Comenta funcoes complexas com JSDoc
- Segue o estilo ESLint configurado no projeto

### Componentes React

- Um componente por ficheiro
- Nomes em PascalCase
- Props com interfaces TypeScript
- Usa hooks do React corretamente

### API Routes (Next.js)

- Valida sempre com Zod
- Retorna erros com mensagens claras
- Usa try/catch em todas as rotas
- Aplica autorizacao necessaria

## Estrutura de Branches

```
main          - producao estavel
develop       - desenvolvimento ativo
feat/*        - novas funcionalidades
fix/*         - correcao de bugs
hotfix/*      - correcoes urgentes em producao
```

## Setup de Desenvolvimento

```bash
# 1. Clonar
git clone https://github.com/smpsandro1239/AldeiasGames.git
cd AldeiasGames

# 2. Instalar dependencias
bun install

# 3. Configurar ambiente
cp .env.example .env
# Edita .env com os teus valores

# 4. Inicializar base de dados
bunx prisma db push
bunx prisma db seed

# 5. Iniciar servidor de desenvolvimento
bun run dev
```

## Testes

```bash
# Todos os testes
bun test

# Testes especificos
bun test src/__tests__/auth.test.ts

# Com cobertura
bun test --coverage
```

## Revisao de Codigo

Todos os PRs sao revistos antes de serem aceites. A revisao verifica:
- Qualidade do codigo
- Cobertura de testes
- Performance
- Seguranca
- Documentacao

---

*Desenvolvido com dedicacao para as comunidades de Portugal* 🇵🇹
