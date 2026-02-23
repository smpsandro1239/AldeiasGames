import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');
  console.log('📋 Criando utilizadores de teste com credenciais corretas...\n');

  const passwordHash = await bcrypt.hash('123456', 10);

  // ============================================
  // CRIAR PLANOS
  // ============================================
  
  // Verificar se já existem planos
  let planoGratuito = await prisma.plano.findFirst({ where: { nome: 'Gratuito' } });
  if (!planoGratuito) {
    planoGratuito = await prisma.plano.create({
      data: {
        nome: 'Gratuito',
        precoMensal: 0,
        maxEventos: 3,
        maxJogos: 10,
        maxParticipacoes: 100,
        descricao: 'Plano gratuito para aldeias pequenas',
      },
    });
    console.log('✓ Plano Gratuito criado');
  } else {
    console.log('✓ Plano Gratuito já existe');
  }

  let planoPro = await prisma.plano.findFirst({ where: { nome: 'Pro' } });
  if (!planoPro) {
    planoPro = await prisma.plano.create({
      data: {
        nome: 'Pro',
        precoMensal: 19,
        maxEventos: 10,
        maxJogos: 50,
        maxParticipacoes: 5000,
        descricao: 'Plano Pro para aldeias médias',
      },
    });
    console.log('✓ Plano Pro criado');
  } else {
    console.log('✓ Plano Pro já existe');
  }

  let planoEnterprise = await prisma.plano.findFirst({ where: { nome: 'Enterprise' } });
  if (!planoEnterprise) {
    planoEnterprise = await prisma.plano.create({
      data: {
        nome: 'Enterprise',
        precoMensal: 49,
        maxEventos: 999,
        maxJogos: 999,
        maxParticipacoes: 999999,
        descricao: 'Plano Enterprise para grandes aldeias',
      },
    });
    console.log('✓ Plano Enterprise criado');
  } else {
    console.log('✓ Plano Enterprise já existe');
  }

  // ============================================
  // CRIAR UTILIZADORES DE TESTE (4 ROLES)
  // ============================================

  // 1. SUPER ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@aldeias.pt' },
    update: { passwordHash },
    create: {
      nome: 'Super Administrador',
      email: 'admin@aldeias.pt',
      passwordHash,
      role: 'super_admin',
    },
  });
  console.log('✓ Super Admin criado: admin@aldeias.pt / 123456');

  // 2. CRIAR ALDEIA (para admin_aldeia e vendedor)
  const aldeia = await prisma.aldeia.upsert({
    where: { id: 'aldeia-vila-verde' },
    update: {},
    create: {
      id: 'aldeia-vila-verde',
      nome: 'Vila Verde',
      descricao: 'Aldeia tradicional do Minho - Freguesia de Vila Verde',
      localizacao: 'Braga, Portugal',
    },
  });
  console.log('✓ Aldeia Vila Verde criada');

  // 3. ADMIN ALDEIA
  const adminAldeia = await prisma.user.upsert({
    where: { email: 'aldeia@gmail.com' },
    update: { passwordHash, aldeiaId: aldeia.id },
    create: {
      nome: 'Admin Aldeia',
      email: 'aldeia@gmail.com',
      passwordHash,
      role: 'aldeia_admin',
      aldeiaId: aldeia.id,
    },
  });
  console.log('✓ Admin Aldeia criado: aldeia@gmail.com / 123456');

  // 4. VENDEDOR
  const vendedor = await prisma.user.upsert({
    where: { email: 'vendedor@gmail.com' },
    update: { passwordHash, aldeiaId: aldeia.id },
    create: {
      nome: 'Vendedor Teste',
      email: 'vendedor@gmail.com',
      passwordHash,
      role: 'vendedor',
      aldeiaId: aldeia.id,
    },
  });
  console.log('✓ Vendedor criado: vendedor@gmail.com / 123456');

  // 5. JOGADOR (user normal)
  const jogador = await prisma.user.upsert({
    where: { email: 'smpsandro1239@gmail.com' },
    update: { passwordHash },
    create: {
      nome: 'Jogador Teste',
      email: 'smpsandro1239@gmail.com',
      passwordHash,
      role: 'user',
    },
  });
  console.log('✓ Jogador criado: smpsandro1239@gmail.com / 123456');

  // ============================================
  // CRIAR EVENTOS E JOGOS DE EXEMPLO
  // ============================================

  const evento = await prisma.evento.upsert({
    where: { id: 'evento-festa-sao-joao' },
    update: {},
    create: {
      id: 'evento-festa-sao-joao',
      aldeiaId: aldeia.id,
      nome: 'Festa de São João 2025',
      descricao: 'Festa tradicional de São João - Angariação de fundos',
      dataInicio: new Date(),
      dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      estado: 'ativo',
    },
  });
  console.log('✓ Evento Festa de São João criado');

  // Jogo Poio da Vaca
  const jogoPoio = await prisma.jogo.upsert({
    where: { id: 'jogo-poio-vaca-1' },
    update: {},
    create: {
      id: 'jogo-poio-vaca-1',
      eventoId: evento.id,
      tipo: 'poio_vaca',
      config: JSON.stringify({ linhas: 10, colunas: 10 }),
      precoParticipacao: 2,
      estado: 'ativo',
    },
  });
  console.log('✓ Jogo Poio da Vaca criado (10x10, 2€ por quadrado)');

  // Jogo Rifa
  const jogoRifa = await prisma.jogo.upsert({
    where: { id: 'jogo-rifa-1' },
    update: {},
    create: {
      id: 'jogo-rifa-1',
      eventoId: evento.id,
      tipo: 'rifa',
      config: JSON.stringify({ totalBilhetes: 500 }),
      precoParticipacao: 1,
      estado: 'ativo',
    },
  });
  console.log('✓ Jogo Rifa criado (500 bilhetes, 1€ por bilhete)');

  // Jogo Tombola
  const jogoTombola = await prisma.jogo.upsert({
    where: { id: 'jogo-tombola-1' },
    update: {},
    create: {
      id: 'jogo-tombola-1',
      eventoId: evento.id,
      tipo: 'tombola',
      config: JSON.stringify({ totalBilhetes: 100 }),
      precoParticipacao: 5,
      estado: 'ativo',
    },
  });
  console.log('✓ Jogo Tombola criado (100 bilhetes, 5€ por bilhete)');

  // ============================================
  // CRIAR ALGUMAS PARTICIPAÇÕES DE EXEMPLO
  // ============================================
  
  try {
    // Verificar se já existem participações
    const participacoesExistentes = await prisma.participacao.count();
    
    if (participacoesExistentes === 0) {
      // Participação do jogador no Poio da Vaca
      await prisma.participacao.create({
        data: {
          jogoId: jogoPoio.id,
          userId: jogador.id,
          valorPago: 2,
          dadosParticipacao: JSON.stringify({ linha: 1, coluna: 1 }),
          metodoPagamento: 'mbway',
        },
      });

      // Participação do jogador na Rifa
      await prisma.participacao.create({
        data: {
          jogoId: jogoRifa.id,
          userId: jogador.id,
          valorPago: 1,
          dadosParticipacao: JSON.stringify({ numero: 42 }),
          metodoPagamento: 'mbway',
        },
      });

      console.log('✓ Participações de exemplo criadas');
    } else {
      console.log('✓ Participações já existem, a ignorar');
    }
  } catch (e) {
    console.log('⚠ Erro ao criar participações:', e);
  }

  // ============================================
  // RESUMO FINAL
  // ============================================
  
  console.log('\n============================================');
  console.log('🎉 SEED COMPLETO!');
  console.log('============================================');
  console.log('\n📋 CREDENCIAIS DE TESTE (Quick Login):');
  console.log('┌─────────────────┬──────────────────────────┬──────────┐');
  console.log('│ Role            │ Email                    │ Password │');
  console.log('├─────────────────┼──────────────────────────┼──────────┤');
  console.log('│ Super Admin     │ admin@aldeias.pt         │ 123456   │');
  console.log('│ Admin Aldeia    │ aldeia@gmail.com         │ 123456   │');
  console.log('│ Vendedor        │ vendedor@gmail.com       │ 123456   │');
  console.log('│ Jogador         │ smpsandro1239@gmail.com  │ 123456   │');
  console.log('└─────────────────┴──────────────────────────┴──────────┘');
  console.log('\n✅ Todas as contas usam a mesma password: 123456');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
