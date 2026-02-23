import { NextResponse } from 'next/server';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body as EmailData;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Destinatário, assunto e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    // Em produção, integrar com serviço de email real (SendGrid, Resend, etc.)
    // Por agora, simulamos o envio e registamos no console
    console.log('📧 EMAIL ENVIADO:');
    console.log('   Para:', to);
    console.log('   Assunto:', subject);
    console.log('   HTML:', html.substring(0, 200) + '...');

    // Simular sucesso
    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      to,
      subject,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar email' },
      { status: 500 }
    );
  }
}

// Função helper para gerar templates de email
export function generateParticipacaoEmail(data: {
  nomeCliente: string;
  emailCliente: string;
  jogoTipo: string;
  coordenadaOuNumero: string;
  valor: number;
  aldeia: string;
  evento: string;
  referencia: string;
  metodoPagamento: string;
  estadoPagamento: string;
}) {
  const {
    nomeCliente,
    jogoTipo,
    coordenadaOuNumero,
    valor,
    aldeia,
    evento,
    referencia,
    metodoPagamento,
    estadoPagamento
  } = data;

  const metodoTexto = metodoPagamento === 'mbway' ? 'MBWay' : 'Dinheiro';
  const estadoTexto = estadoPagamento === 'pago' ? '✅ Pago' : '⏳ Pendente';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #22c55e; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: bold; color: #666; }
    .info-value { color: #333; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
    .badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .badge-success { background: #dcfce7; color: #16a34a; }
    .badge-pending { background: #fef3c7; color: #d97706; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 Aldeias Games</h1>
      <p>Participação Registada</p>
    </div>
    <div class="content">
      <h2>Olá, ${nomeCliente}! 👋</h2>
      <p>A sua participação foi registada com sucesso!</p>
      
      <div class="info-box">
        <h3>📋 Detalhes da Participação</h3>
        <div class="info-row">
          <span class="info-label">Jogo:</span>
          <span class="info-value">${jogoTipo}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${jogoTipo.includes('Poio') ? 'Coordenada' : 'Número'}:</span>
          <span class="info-value" style="font-size: 18px; font-weight: bold; color: #22c55e;">${coordenadaOuNumero}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Aldeia:</span>
          <span class="info-value">${aldeia}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Evento:</span>
          <span class="info-value">${evento}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Valor:</span>
          <span class="info-value" style="font-size: 20px; font-weight: bold; color: #22c55e;">${valor.toFixed(2)}€</span>
        </div>
      </div>

      <div class="info-box">
        <h3>💳 Pagamento</h3>
        <div class="info-row">
          <span class="info-label">Método:</span>
          <span class="info-value">${metodoTexto}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Estado:</span>
          <span class="info-value">
            <span class="badge ${estadoPagamento === 'pago' ? 'badge-success' : 'badge-pending'}">${estadoTexto}</span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Referência:</span>
          <span class="info-value" style="font-family: monospace;">${referencia}</span>
        </div>
      </div>

      ${metodoPagamento === 'dinheiro' ? `
      <div class="info-box" style="background: #fef3c7; border-left-color: #f59e0b;">
        <h3>ℹ️ Pagamento em Dinheiro</h3>
        <p>Dirija-se à organização do evento para efetuar o pagamento. Apresente a sua referência: <strong>${referencia}</strong></p>
      </div>
      ` : ''}

      ${metodoPagamento === 'mbway' ? `
      <div class="info-box" style="background: #dbeafe; border-left-color: #3b82f6;">
        <h3>📱 Pagamento MBWay</h3>
        <p>Enviámos uma notificação para o seu telemóvel. Confirme o pagamento na aplicação MBWay.</p>
        <p>Referência: <strong>${referencia}</strong></p>
      </div>
      ` : ''}

      <p style="margin-top: 20px;">Boa sorte! 🍀</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Aldeias Games - Jogos tradicionais de aldeias</p>
      <p>Este email foi enviado automaticamente. Não responda.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Aldeias Games - Participação Registada

Olá ${nomeCliente},

A sua participação foi registada com sucesso!

Detalhes:
- Jogo: ${jogoTipo}
- ${jogoTipo.includes('Poio') ? 'Coordenada' : 'Número'}: ${coordenadaOuNumero}
- Aldeia: ${aldeia}
- Evento: ${evento}
- Valor: ${valor.toFixed(2)}€

Pagamento:
- Método: ${metodoTexto}
- Estado: ${estadoTexto}
- Referência: ${referencia}

Boa sorte!

---
© ${new Date().getFullYear()} Aldeias Games
  `;

  return { html, text: textContent };
}

export function generateAdminNotificationEmail(data: {
  nomeCliente: string;
  emailCliente: string;
  telefoneCliente?: string;
  jogoTipo: string;
  coordenadaOuNumero: string;
  valor: number;
  aldeia: string;
  evento: string;
  referencia: string;
  metodoPagamento: string;
}) {
  const {
    nomeCliente,
    emailCliente,
    telefoneCliente,
    jogoTipo,
    coordenadaOuNumero,
    valor,
    aldeia,
    evento,
    referencia,
    metodoPagamento
  } = data;

  const metodoTexto = metodoPagamento === 'mbway' ? 'MBWay' : 'Dinheiro';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: bold; color: #666; }
    .info-value { color: #333; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Nova Participação</h1>
      <p>Notificação para Administrador</p>
    </div>
    <div class="content">
      <h2>Nova participação registada!</h2>
      
      <div class="info-box">
        <h3>👤 Cliente</h3>
        <div class="info-row">
          <span class="info-label">Nome:</span>
          <span class="info-value">${nomeCliente}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${emailCliente}</span>
        </div>
        ${telefoneCliente ? `
        <div class="info-row">
          <span class="info-label">Telefone:</span>
          <span class="info-value">${telefoneCliente}</span>
        </div>
        ` : ''}
      </div>

      <div class="info-box">
        <h3>📋 Participação</h3>
        <div class="info-row">
          <span class="info-label">Jogo:</span>
          <span class="info-value">${jogoTipo}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${jogoTipo.includes('Poio') ? 'Coordenada' : 'Número'}:</span>
          <span class="info-value" style="font-size: 18px; font-weight: bold; color: #3b82f6;">${coordenadaOuNumero}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Aldeia:</span>
          <span class="info-value">${aldeia}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Evento:</span>
          <span class="info-value">${evento}</span>
        </div>
      </div>

      <div class="info-box">
        <h3>💰 Pagamento</h3>
        <div class="info-row">
          <span class="info-label">Valor:</span>
          <span class="info-value" style="font-size: 20px; font-weight: bold; color: #22c55e;">${valor.toFixed(2)}€</span>
        </div>
        <div class="info-row">
          <span class="info-label">Método:</span>
          <span class="info-value">${metodoTexto}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Referência:</span>
          <span class="info-value" style="font-family: monospace;">${referencia}</span>
        </div>
      </div>

      ${metodoPagamento === 'dinheiro' ? `
      <div class="info-box" style="background: #fef3c7; border-left-color: #f59e0b;">
        <h3>⚠️ Pagamento em Dinheiro</h3>
        <p>Este cliente optou por pagar em dinheiro. Aguarde o contacto ou presença do cliente.</p>
      </div>
      ` : ''}

      ${metodoPagamento === 'mbway' ? `
      <div class="info-box" style="background: #dcfce7; border-left-color: #22c55e;">
        <h3>📱 MBWay</h3>
        <p>Pagamento via MBWay pendente de confirmação.</p>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Aldeias Games - Painel de Administração</p>
    </div>
  </div>
</body>
</html>
  `;

  return { html };
}
