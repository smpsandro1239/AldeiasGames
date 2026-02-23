import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function saveBase64Image(base64String: string): Promise<string> {
  // Se não for base64 válido ou já for uma URL, retornar como está
  if (!base64String || !base64String.startsWith('data:image/')) {
    return base64String;
  }

  // Garantir que o diretório existe
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // Extrair extensão e dados
  const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Formato de imagem inválido');
  }

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const imageData = matches[2];
  const fileName = `${uuidv4()}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Guardar ficheiro
  fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));

  // Retornar URL pública
  return `/uploads/${fileName}`;
}

export function deleteImage(imageUrl: string) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;

  const fileName = imageUrl.replace('/uploads/', '');
  const filePath = path.join(UPLOAD_DIR, fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
