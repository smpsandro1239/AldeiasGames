import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'custom.db');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// GET - Listar backups disponíveis
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Criar diretório de backup se não existir
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Listar ficheiros de backup
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .map(f => {
        const filePath = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          nome: f,
          tamanho: stats.size,
          criadoEm: stats.birthtime,
          modificadoEm: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

    // Verificar tamanho da base de dados atual
    const dbStats = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH) : null;

    return NextResponse.json({
      backups: files,
      dbAtual: dbStats ? {
        tamanho: dbStats.size,
        modificadoEm: dbStats.mtime
      } : null
    });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar backup
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Criar diretório de backup se não existir
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Gerar nome do ficheiro de backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Usar VACUUM INTO para um backup consistente do SQLite
    // Isto evita corrupção se houver escritas simultâneas
    try {
      await db.$executeRawUnsafe(`VACUUM INTO '${backupPath}'`);
    } catch (sqliteError) {
      console.error('Erro ao executar VACUUM INTO, tentando cópia direta:', sqliteError);
      // Fallback para cópia direta se VACUUM INTO falhar (ex: versão antiga do SQLite)
      fs.copyFileSync(DB_PATH, backupPath);
    }

    return NextResponse.json({
      success: true,
      message: 'Backup criado com sucesso',
      backup: {
        nome: backupName,
        tamanho: fs.statSync(backupPath).size,
        criadoEm: new Date()
      }
    });
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
