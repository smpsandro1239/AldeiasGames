import { NextResponse } from 'next/server';
import { saveBase64Image } from '@/lib/storage';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'Nenhuma imagem fornecida' }, { status: 400 });
    }

    const imageUrl = await saveBase64Image(image);
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: error.message || 'Erro no upload' }, { status: 500 });
  }
}
