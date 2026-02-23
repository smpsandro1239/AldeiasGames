import { loginSchema, wizardSchema } from '../lib/validations';

describe('Validações Zod', () => {
  test('loginSchema aceita email válido e password longa', () => {
    const data = { email: 'test@example.com', password: 'password123' };
    expect(loginSchema.safeParse(data).success).toBe(true);
  });

  test('loginSchema rejeita email inválido', () => {
    const data = { email: 'invalid-email', password: 'password123' };
    expect(loginSchema.safeParse(data).success).toBe(false);
  });

  test('wizardSchema exige código postal no formato PT', () => {
    const validData = {
      morada: 'Rua de Teste, 123',
      codigoPostal: '4700-000',
      localidade: 'Braga',
      autorizacaoCM: true
    };
    expect(wizardSchema.safeParse(validData).success).toBe(true);

    const invalidData = { ...validData, codigoPostal: '4700000' };
    expect(wizardSchema.safeParse(invalidData).success).toBe(false);
  });
});
