export function generateOpenApi() {
  return {
    openapi: '3.0.0',
    info: {
      version: '3.11.0',
      title: 'Aldeias Games API',
      description: 'API para gestão de jogos, participações e organizações comunitárias.',
    },
    servers: [{ url: '/api' }],
    paths: {
      '/auth/login': {
        post: {
          summary: 'Login de utilizador',
          responses: { 200: { description: 'Sucesso' } }
        }
      },
      '/aldeias': {
        get: {
          summary: 'Listar organizações comunitárias',
          responses: { 200: { description: 'Sucesso' } }
        },
        post: {
          summary: 'Criar nova organização (Admin)',
          responses: { 201: { description: 'Criado' } }
        }
      },
      '/eventos': {
        get: {
          summary: 'Listar eventos de angariação de fundos',
          responses: { 200: { description: 'Sucesso' } }
        }
      },
      '/jogos': {
        get: {
          summary: 'Listar jogos ativos',
          responses: { 200: { description: 'Sucesso' } }
        }
      },
      '/participacoes': {
        post: {
          summary: 'Registar participação num jogo',
          responses: { 201: { description: 'Registada' } }
        }
      },
      '/stripe/checkout': {
        post: {
          summary: 'Criar sessão de checkout Stripe',
          responses: { 200: { description: 'URL de checkout' } }
        }
      }
    }
  };
}
