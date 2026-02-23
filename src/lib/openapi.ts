export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Aldeias Games API',
    version: '3.12.0',
    description: 'Plataforma SaaS multi-tenant para angariação de fundos através de jogos tradicionais portugueses.',
  },
  servers: [
    {
      url: '/api',
      description: 'API Principal',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nome: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['super_admin', 'aldeia_admin', 'vendedor', 'user'] },
        },
      },
      Aldeia: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nome: { type: 'string' },
          slug: { type: 'string' },
          tipoOrganizacao: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Fazer login',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Login bem sucedido' },
          401: { description: 'Credenciais inválidas' },
        },
      },
    },
    '/aldeias': {
      get: {
        summary: 'Listar aldeias',
        tags: ['Aldeias'],
        responses: {
          200: { description: 'Lista de aldeias' },
        },
      },
    },
    '/jogos': {
      get: {
        summary: 'Listar jogos',
        tags: ['Jogos'],
        responses: {
          200: { description: 'Lista de jogos' },
        },
      },
    },
  },
};
