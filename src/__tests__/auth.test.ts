/** @jest-environment node */
import { SignJWT, jwtVerify } from 'jose';

describe('Sistema de Autenticação JWT', () => {
  const secret = new TextEncoder().encode('test-secret-key-123456789012345678');

  test('consegue gerar e verificar um token', async () => {
    const payload = { id: 'user-1', role: 'CLIENTE' };
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    const { payload: verifiedPayload } = await jwtVerify(token, secret);
    expect(verifiedPayload.id).toBe(payload.id);
    expect(verifiedPayload.role).toBe(payload.role);
  });
});
