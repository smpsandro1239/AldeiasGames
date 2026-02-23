import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { generateParticipacaoEmail, generateAdminNotificationEmail } from '../emails/route';
import crypto from 'crypto';

// Generate unique reference
function generateReferencia(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AG-${timestamp}-${random}`;
}

// Generate SHA-256 hash
function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate unique seed for raspadinha
function generateSeed(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Determine prize for raspadinha based on percentage configuration
function determinePrize(
  premiosConfig: { nome: string; tipo: string; percentagem: number; valor: number }[],
  stockInicial: number,
  cardNumber: number
): { premio: { nome: string; valor: number; tipo: string } | null; seed: string; hash: string } {
  const seed = generateSeed();
  
  // Parse prizes configuration
  const premios = premiosConfig || [];
  
  // Calculate cumulative ranges based on percentages
  // Example: If stock is 1000 and we have 5% for prize A, that's cards 1-50
  // Prize ranges are assigned sequentially based on percentage order
  let prizeIndex = -1;
  let currentCard = 1;
  
  for (let i = 0; i < premios.length; i++) {
    const premio = premios[i];
    const quantity = Math.round(premio.percentagem * stockInicial);
    const endCard = currentCard + quantity - 1;
    
    // Check if this card falls in this prize range
    if (cardNumber >= currentCard && cardNumber <= endCard && quantity > 0) {
      prizeIndex = i;
      break;
    }
    currentCard = endCard + 1;
  }
  
  // If no prize found, return null (no prize)
  const premio = prizeIndex >= 0 
    ? { 
        nome: premios[prizeIndex].nome, 
        valor: premios[prizeIndex].valor,
        tipo: premios[prizeIndex].tipo 
      } 
    : null;
  
  // Generate hash for verification
  const hashData = JSON.stringify({ seed, premio, cardNumber });
  const hash = generateHash(hashData);
  
  return { premio, seed, hash };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jogoId = searchParams.get('jogoId');
    const userId = searchParams.get('userId');
    
    const where: any = {};
    if (jogoId) where.jogoId = jogoId;
    if (userId) where.userId = userId;
    
    const participacoes = await db.participacao.findMany({
      where,
      include: {
        jogo: {
          include: {
            evento: {
              include: { aldeia: true }
            }
          }
        },
        user: {
          select: { id: true, nome: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get client info via raw query since Prisma query engine doesn't have the new fields
    const ids = participacoes.map(p => p.id);
    let clientInfo: any[] = [];
    if (ids.length > 0) {
      // Use Prisma's raw query with proper parameter binding
      const idsPlaceholder = ids.map(() => '?').join(',');
      clientInfo = await db.$queryRawUnsafe(
        `SELECT id, nomeCliente, telefoneCliente, emailCliente, adminRegistouId,
                seedRaspe, hashRaspe, resultadoRaspe, revelado, reveladoAt, numeroCartao
         FROM participacoes 
         WHERE id IN (${idsPlaceholder})`,
        ...ids
      );
    }
    
    // Create a map for quick lookup
    const clientInfoMap = new Map(clientInfo.map(c => [c.id, c]));

    return NextResponse.json(participacoes.map(p => {
      const client = clientInfoMap.get(p.id) || {};
      return {
        ...p,
        dadosParticipacao: JSON.parse(p.dadosParticipacao),
        nomeCliente: client.nomeCliente || null,
        telefoneCliente: client.telefoneCliente || null,
        emailCliente: client.emailCliente || null,
        adminRegistouId: client.adminRegistouId || null,
        // Raspadinha fields
        numeroCartao: client.numeroCartao || null,
        seedRaspe: client.seedRaspe || null,
        hashRaspe: client.hashRaspe || null,
        resultadoRaspe: client.resultadoRaspe ? JSON.parse(client.resultadoRaspe) : null,
        revelado: client.revelado || false,
        reveladoAt: client.reveladoAt || null,
      };
    }));
  } catch (error) {
    console.error('Erro ao buscar participações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar participações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      jogoId, 
      dadosParticipacao, 
      valorPago, 
      metodoPagamento, 
      telefoneMbway,
      adminParaCliente,
      nomeCliente,
      telefoneCliente,
      emailCliente,
      // Raspadinha specific
      isRaspadinha,
      quantidade
    } = body;

    console.log('Participação request:', { jogoId, dadosParticipacao, valorPago, metodoPagamento, telefoneMbway, userId: user.id, adminParaCliente, nomeCliente, isRaspadinha, quantidade });

    // Validar identificação do cliente se admin está a registar para cliente
    if (adminParaCliente) {
      if (!nomeCliente || !nomeCliente.trim()) {
        return NextResponse.json(
          { error: 'Nome do cliente é obrigatório' },
          { status: 400 }
        );
      }
      if (!telefoneCliente?.trim() && !emailCliente?.trim()) {
        return NextResponse.json(
          { error: 'É obrigatório indicar telemóvel OU email do cliente' },
          { status: 400 }
        );
      }
    }

    // Verificar se o jogo existe e está ativo
    const jogo = await db.jogo.findUnique({
      where: { id: jogoId },
      include: {
        evento: {
          include: { aldeia: true }
        }
      }
    });

    console.log('Jogo encontrado:', jogo);

    if (!jogo) {
      return NextResponse.json(
        { error: 'Jogo não encontrado' },
        { status: 404 }
      );
    }

    if (jogo.estado !== 'ativo') {
      return NextResponse.json(
        { error: 'Jogo não está ativo' },
        { status: 400 }
      );
    }

    // === RASPADINHA ===
    if (isRaspadinha || jogo.tipo === 'raspadinha') {
      const quantidadeCartoes = quantidade || 1;
      
      // Verificar stock
      const stockRestante = jogo.stockRestante || 0;
      if (stockRestante < quantidadeCartoes) {
        return NextResponse.json(
          { error: `Apenas ${stockRestante} cartões disponíveis` },
          { status: 400 }
        );
      }

      // Verificar limite por usuário
      if (jogo.limitePorUsuario) {
        const participacoesExistentes = await db.participacao.count({
          where: { jogoId, userId: user.id }
        });
        if (participacoesExistentes + quantidadeCartoes > jogo.limitePorUsuario) {
          return NextResponse.json(
            { error: `Limite de ${jogo.limitePorUsuario} cartões por pessoa` },
            { status: 400 }
          );
        }
      }

      // Parse premios configuration
      const premiosConfig = jogo.premiosRaspadinha 
        ? (typeof jogo.premiosRaspadinha === 'string' 
            ? JSON.parse(jogo.premiosRaspadinha) 
            : jogo.premiosRaspadinha)
        : [];

      // Buscar último número de cartão usado
      const ultimaParticipacao = await db.$queryRaw<{numeroCartao: number}[]>`
        SELECT MAX(numeroCartao) as numeroCartao 
        FROM participacoes 
        WHERE jogoId = ${jogoId}
      `;
      let proximoNumero = (ultimaParticipacao[0]?.numeroCartao || 0) + 1;

      // Criar participações para cada cartão com seed/hash
      const participacoes = [];
      const referencia = generateReferencia();

      for (let i = 0; i < quantidadeCartoes; i++) {
        const numeroCartao = proximoNumero + i;
        
        // Determine prize and generate seed/hash
        const { premio, seed, hash } = determinePrize(
          premiosConfig,
          jogo.stockInicial || 100,
          numeroCartao
        );
        
        // Generate unique ID
        const participacaoId = `rasp-${jogoId.slice(0, 8)}-${numeroCartao.toString().padStart(4, '0')}-${Date.now().toString(36)}`;
        
        // Criar participação usando raw query para incluir seed/hash
        await db.$executeRaw`
          INSERT INTO participacoes (
            id, jogoId, userId, valorPago, dadosParticipacao, metodoPagamento, 
            referencia, estadoPagamento, telefoneMbway, adminRegistouId, 
            nomeCliente, telefoneCliente, emailCliente, numeroCartao,
            seedRaspe, hashRaspe, resultadoRaspe, revelado, createdAt, updatedAt
          )
          VALUES (
            ${participacaoId},
            ${jogoId},
            ${user.id},
            ${jogo.precoParticipacao},
            ${JSON.stringify({ numero: numeroCartao })},
            ${metodoPagamento},
            ${`${referencia}-${i+1}`},
            ${metodoPagamento === 'dinheiro' ? 'pago' : 'pendente'},
            ${telefoneMbway || null},
            ${adminParaCliente ? user.id : null},
            ${adminParaCliente ? nomeCliente : null},
            ${adminParaCliente ? telefoneCliente : null},
            ${adminParaCliente ? emailCliente : null},
            ${numeroCartao},
            ${seed},
            ${hash},
            ${JSON.stringify({ premio, cardNumber: numeroCartao })},
            ${0},
            datetime('now'),
            datetime('now')
          )
        `;

        participacoes.push({
          id: participacaoId,
          numeroCartao,
          valorPago: jogo.precoParticipacao,
          seed,
          hash,
          premio // Include prize info for frontend (but hidden until revealed)
        });
      }

      // Atualizar stock restante
      await db.$executeRaw`
        UPDATE jogos 
        SET stockRestante = stockRestante - ${quantidadeCartoes}
        WHERE id = ${jogoId}
      `;

      return NextResponse.json({
        success: true,
        participacoes: participacoes.map(p => ({
          id: p.id,
          numeroCartao: p.numeroCartao,
          valorPago: p.valorPago
          // Don't send seed/hash/prize to frontend - only after reveal
        })),
        quantidade: quantidadeCartoes,
        valorTotal: quantidadeCartoes * jogo.precoParticipacao,
        mensagem: metodoPagamento === 'mbway' 
          ? 'Cartões comprados! Verifique a notificação MBWay.'
          : 'Cartões comprados! Raspe os seus cartões para revelar os prémios.'
      }, { status: 201 });
    }

    // === OUTROS JOGOS ===
    if (!jogoId || !dadosParticipacao || !valorPago || !metodoPagamento) {
      return NextResponse.json(
        { error: 'Jogo, dados, valor e método de pagamento são obrigatórios' },
        { status: 400 }
      );
    }

    if (metodoPagamento === 'mbway' && !telefoneMbway) {
      return NextResponse.json(
        { error: 'Telefone MBWay é obrigatório para pagamentos via MBWay' },
        { status: 400 }
      );
    }

    // Verificar duplicados
    // Usamos uma abordagem determinística para o stringify e confiamos no findFirst.
    // O fallback de carregar tudo em memória foi removido por performance.
    const dadosStr = JSON.stringify(dadosParticipacao);
    let existente = await db.participacao.findFirst({
      where: {
        jogoId,
        dadosParticipacao: dadosStr
      }
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Esta participação já foi comprada' },
        { status: 409 }
      );
    }

    // Gerar referência única
    const referencia = generateReferencia();

    // Criar participação
    const participacao = await db.participacao.create({
      data: {
        jogoId,
        userId: user.id,
        valorPago,
        dadosParticipacao: dadosStr,
        metodoPagamento,
        telefoneMbway: telefoneMbway || null,
        referencia,
        estadoPagamento: metodoPagamento === 'dinheiro' ? 'pendente' : 'pendente',
      },
      include: {
        jogo: {
          include: {
            evento: {
              include: { aldeia: true }
            }
          }
        },
        user: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
    
    // Update with client info if admin is registering for a client (using raw query)
    if (adminParaCliente && user.id) {
      await db.$executeRaw`
        UPDATE participacoes 
        SET adminRegistouId = ${user.id},
            nomeCliente = ${nomeCliente || null},
            telefoneCliente = ${telefoneCliente || null},
            emailCliente = ${emailCliente || null}
        WHERE id = ${participacao.id}
      `;
    }

    // Preparar dados para emails
    const jogoTipo = jogo.tipo === 'poio_vaca' ? 'Poio da Vaca' : 
                     jogo.tipo === 'rifa' ? 'Rifa' : 'Tombola';
    const coordenadaOuNumero = jogo.tipo === 'poio_vaca' 
      ? `${dadosParticipacao.letra}${dadosParticipacao.numero}`
      : `${dadosParticipacao.numero}`;

    // Determinar destinatário do email
    const clienteNome = adminParaCliente ? nomeCliente : user.nome;
    const clienteEmail = adminParaCliente ? (emailCliente || user.email) : user.email;

    // Enviar email para o cliente (simulado - em produção usar serviço real)
    try {
      const clienteEmailContent = generateParticipacaoEmail({
        nomeCliente: clienteNome,
        emailCliente: clienteEmail,
        jogoTipo,
        coordenadaOuNumero,
        valor: valorPago,
        aldeia: jogo.evento?.aldeia?.nome || 'Aldeia',
        evento: jogo.evento?.nome || 'Evento',
        referencia,
        metodoPagamento,
        estadoPagamento: 'pendente'
      });

      // Simular envio de email (em produção, usar SendGrid, Resend, etc.)
      console.log('📧 EMAIL PARA CLIENTE:', clienteEmail);
      console.log('   Assunto: 🎮 Participação Registada -', jogoTipo);
      console.log('   Preview:', clienteEmailContent.text?.substring(0, 100) + '...');
    } catch (emailError) {
      console.error('Erro ao preparar email para cliente:', emailError);
      // Não falhar a participação se o email falhar
    }

    // Notificar administradores (simulado - em produção usar serviço real)
    try {
      const adminEmail = generateAdminNotificationEmail({
        nomeCliente: clienteNome,
        emailCliente: clienteEmail,
        telefoneCliente: adminParaCliente ? telefoneCliente : telefoneMbway,
        jogoTipo,
        coordenadaOuNumero,
        valor: valorPago,
        aldeia: jogo.evento?.aldeia?.nome || 'Aldeia',
        evento: jogo.evento?.nome || 'Evento',
        referencia,
        metodoPagamento
      });

      // Buscar admins para notificar
      const admins = await db.user.findMany({
        where: {
          OR: [
            { role: 'super_admin' },
            { aldeiaId: jogo.evento?.aldeiaId, role: 'aldeia_admin' }
          ]
        },
        select: { email: true, nome: true }
      });

      // Simular envio de emails (em produção, usar SendGrid, Resend, etc.)
      for (const admin of admins) {
        console.log('📧 EMAIL PARA ADMIN:', admin.email);
        console.log('   Nome:', admin.nome);
        console.log('   Assunto: 🔔 Nova Participação -', jogoTipo);
      }
    } catch (emailError) {
      console.error('Erro ao preparar notificação para admins:', emailError);
    }

    return NextResponse.json({
      ...participacao,
      dadosParticipacao: JSON.parse(participacao.dadosParticipacao),
      mensagem: metodoPagamento === 'mbway' 
        ? 'Participação registada! Verifique a notificação MBWay no seu telemóvel.'
        : 'Participação registada! Dirija-se à organização para efetuar o pagamento.'
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Esta participação já foi comprada' },
        { status: 409 }
      );
    }
    if (error.code === 'P2003') {
      console.error('Foreign key constraint - userId não encontrado:', user?.id);
      return NextResponse.json(
        { error: 'Erro de autenticação. Por favor, faça login novamente.' },
        { status: 401 }
      );
    }
    console.error('Erro ao criar participação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar participação' },
      { status: 500 }
    );
  }
}
