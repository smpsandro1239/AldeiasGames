# Testes Manuais + E2E - AldeiasGames

## 1. Testes de Autenticação

### Registo de novo utilizador
- **Endpoint**: POST /api/auth/register
- **Status**: 200 OK
- **Dados de teste**: {"nome":"Test User","email":"test@example.com","password":"password123"}
- **Resultado**: Sucesso. Utilizador criado com ID: cmm2r77wx0000o9815nntemsm
- **Screenshot**: 01_testes-manuais-login-registo-ok.png

### Login com credenciais válidas
- **Endpoint**: POST /api/auth/login
- **Status**: 200 OK
- **Dados de teste**: {"email":"test@example.com","password":"password123"}
- **Resultado**: Sucesso. Token JWT recebido com sucesso.
- **Screenshot**: 01_testes-manuais-login-registo-ok.png

### Logout
- **Endpoint**: POST /api/auth/logout
- **Status**: Redirecionamento para página (esperado)
- **Resultado**: Sucesso. Utilizador desautenticado.

## 2. Testes de APIs Principais

### API Eventos
- **Endpoint**: GET /api/eventos
- **Status**: 200 OK
- **Resultado**: Array vazio retornado (esperado sem dados no banco)

### API Jogos
- **Endpoint**: GET /api/jogos
- **Status**: 200 OK
- **Resultado**: JSON com array vazio (esperado sem dados)

## 3. Testes de Funcionalidades Principais

Em progresso...

## 4. Testes de Responsividade

Em progresso...

## 5. Testes de Erros

Em progresso...

**Autoria**: Sandro Pereira 🇵🇹
**Data**: 26/02/2026

