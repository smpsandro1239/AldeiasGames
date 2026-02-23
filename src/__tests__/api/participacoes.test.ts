/** @jest-environment node */
import { POST } from '@/app/api/participacoes/route';
import { db } from '@/lib/db';
import { createToken } from '@/lib/auth';

describe('API Integration: Participações', () => {
  let userToken: string;
  let userId: string;
  let jogoId: string;

  beforeAll(async () => {
    // Setup user
    const user = await db.user.upsert({
      where: { email: 'player@test.com' },
      update: {},
      create: {
        nome: 'Player',
        email: 'player@test.com',
        passwordHash: 'dummy',
        role: 'user'
      }
    });
    userId = user.id;
    userToken = await createToken({ id: user.id, email: user.email, nome: user.nome, role: user.role });

    // Setup aldeia, evento, jogo
    const aldeia = await db.aldeia.create({ data: { nome: 'Aldeia P', tipoOrganizacao: 'aldeia' } });
    const evento = await db.evento.create({
      data: {
        titulo: 'Evento P',
        aldeiaId: aldeia.id,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 86400000)
      }
    });
    const jogo = await db.jogo.create({
      data: {
        titulo: 'Rifa P',
        tipo: 'rifa',
        precoParticipacao: 1.0,
        eventoId: evento.id,
        config: JSON.stringify({ totalBilhetes: 100 })
      }
    });
    jogoId = jogo.id;
  });

  test('consegue registar participação em dinheiro', async () => {
    const participacaoData = {
      jogoId,
      metodoPagamento: 'dinheiro',
      valorPago: 1.0,
      dadosParticipacao: { numero: 42 }
    };

    const req = new Request('http://localhost/api/participacoes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(participacaoData)
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.referencia).toBeDefined();
  });
});
