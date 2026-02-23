import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const validateEnv = () => {
  try {
    return envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erro de validação das variáveis de ambiente:');
      console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));

      if (process.env.NODE_ENV === 'production') {
        throw new Error('Variáveis de ambiente inválidas para produção');
      }
    }
    return null;
  }
};

export const env = validateEnv();
