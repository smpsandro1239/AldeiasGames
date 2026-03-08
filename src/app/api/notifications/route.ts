import { NextResponse } from 'next/server';

// Redirect /api/notifications to /api/notificacoes
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const url = new URL(request.url);
    url.pathname = '/api/notificacoes';
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao obter notificações' }, { status: response.status });
    }
    
    const data = await response.json();
    
    // The frontend expects just an array of notifications
    return NextResponse.json(data.notificacoes || []);
  } catch (error) {
    console.error('Notifications proxy error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const url = new URL(request.url);
    url.pathname = '/api/notificacoes';
    
    const body = await request.json();
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    return response;
  } catch (error) {
    console.error('Notifications proxy POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
