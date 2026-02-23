export function generateOpenApi() {
  return {
    openapi: '3.0.0',
    info: {
      version: '3.11.0',
      title: 'Aldeias Games API',
      description: 'API para gestão de jogos e participações em comunidades locais.',
    },
    servers: [{ url: '/api' }],
    paths: {
      '/auth/login': {
        post: {
          summary: 'Login de utilizador',
          responses: {
            200: { description: 'Sucesso' }
          }
        }
      },
      '/aldeias': {
        get: {
          summary: 'Listar organizações',
          responses: {
            200: { description: 'Sucesso' }
          }
        }
      }
    }
  };
}
