/** @jest-environment node */
import { GET, POST } from '@/app/api/aldeias/route';
import { db } from '@/lib/db';
import { createToken } from '@/lib/auth';

describe('API Integration: Aldeias', () => {
  let adminToken: string;
  let superAdminId: string;

  beforeAll(async () => {
    // Setup super admin
    const superAdmin = await db.user.upsert({
      where: { email: 'superadmin@test.com' },
      update: { role: 'super_admin' },
      create: {
        nome: 'Super Admin',
        email: 'superadmin@test.com',
        passwordHash: 'dummy',
        role: 'super_admin'
      }
    });
    superAdminId = superAdmin.id;
    adminToken = await createToken({
      id: superAdmin.id,
      email: superAdmin.email,
      nome: superAdmin.nome,
      role: superAdmin.role
    });
  });

  test('consegue listar aldeias (público)', async () => {
    const req = new Request('http://localhost/api/aldeias');
    const response = await GET(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('super_admin consegue criar uma aldeia', async () => {
    const aldeiaData = {
      nome: 'Aldeia de Teste ' + Date.now(),
      tipoOrganizacao: 'aldeia',
      localizacao: 'Portugal'
    };

    const req = new Request('http://localhost/api/aldeias', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aldeiaData)
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.nome).toBe(aldeiaData.nome);
  });
});
