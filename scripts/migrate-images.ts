import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function saveBase64(base64String: string) {
  if (!base64String || !base64String.startsWith('data:image/')) return null;

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const imageData = matches[2];
  const fileName = `${uuidv4()}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));
  return `/uploads/${fileName}`;
}

async function main() {
  console.log('🚀 Iniciando migração de imagens...');

  // 1. Aldeias
  const aldeias = await prisma.aldeia.findMany({
    where: { logoBase64: { not: null } }
  });
  console.log(`📦 Encontradas ${aldeias.length} aldeias para migrar.`);
  for (const a of aldeias) {
    const url = await saveBase64(a.logoBase64!);
    if (url) {
      await prisma.aldeia.update({
        where: { id: a.id },
        data: { logoUrl: url, logoBase64: null }
      });
    }
  }

  // 2. Eventos
  const eventos = await prisma.evento.findMany({
    where: { imagemBase64: { not: null } }
  });
  console.log(`📦 Encontrados ${eventos.length} eventos para migrar.`);
  for (const e of eventos) {
    const url = await saveBase64(e.imagemBase64!);
    if (url) {
      await prisma.evento.update({
        where: { id: e.id },
        data: { imageUrl: url, imagemBase64: null }
      });
    }
  }

  // 3. Prémios
  const premios = await prisma.premio.findMany({
    where: { imagemBase64: { not: null } }
  });
  console.log(`📦 Encontrados ${premios.length} prémios para migrar.`);
  for (const p of premios) {
    const url = await saveBase64(p.imagemBase64!);
    if (url) {
      await prisma.premio.update({
        where: { id: p.id },
        data: { imageUrl: url, imagemBase64: null }
      });
    }
  }

  console.log('✅ Migração concluída com sucesso!');
}

main()
  .catch(e => {
    console.error('❌ Erro na migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
