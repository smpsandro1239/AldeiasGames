/** @jest-environment node */
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

describe('API Integration: Auth', () => {
  const testUser = {
    nome: 'Test User',
    email: 'integration@test.com',
    password: 'password123',
    role: 'CLIENTE'
  };

  beforeAll(async () => {
    // Clean up test user
    await db.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { email: testUser.email } });
    await db.$disconnect();
  });

  test('consegue registar um novo utilizador', async () => {
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });

    const response = await registerHandler(req);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user.email).toBe(testUser.email);
  });

  test('consegue fazer login com credenciais válidas', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const response = await loginHandler(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
  });

  test('rejeita login com password errada', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongpassword'
      })
    });

    const response = await loginHandler(req);
    expect(response.status).toBe(401);
  });
});
