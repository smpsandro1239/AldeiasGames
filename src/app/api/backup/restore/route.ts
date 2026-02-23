import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'custom.db');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// POST - Restaurar backup
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { backupName, criarBackupAtual } = body;

    if (!backupName) {
      return NextResponse.json({ error: 'Nome do backup é obrigatório' }, { status: 400 });
    }

    // Validar nome do ficheiro (segurança)
    const safeName = backupName.replace(/[^a-zA-Z0-9_\-\.]/g, '');
    const backupPath = path.join(BACKUP_DIR, safeName);

    // Verificar se o backup existe
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: 'Backup não encontrado' }, { status: 404 });
    }

    // Criar backup da base de dados atual antes de restaurar
    if (criarBackupAtual && fs.existsSync(DB_PATH)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const preRestoreBackupName = `pre-restore-${timestamp}.db`;
      const preRestorePath = path.join(BACKUP_DIR, preRestoreBackupName);
      fs.copyFileSync(DB_PATH, preRestorePath);
    }

    // Restaurar backup
    fs.copyFileSync(backupPath, DB_PATH);

    // Verificar se a restauração foi bem sucedida
    const dbStats = fs.statSync(DB_PATH);
    const backupStats = fs.statSync(backupPath);

    if (dbStats.size !== backupStats.size) {
      return NextResponse.json({ 
        error: 'Restauração pode ter falhado - tamanhos diferentes',
        dbSize: dbStats.size,
        backupSize: backupStats.size
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Backup restaurado com sucesso',
      restoredFrom: backupName,
      dbAtual: {
        tamanho: dbStats.size,
        modificadoEm: new Date()
      }
    });
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Apagar backup
export async function DELETE(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const backupName = searchParams.get('backupName');

    if (!backupName) {
      return NextResponse.json({ error: 'Nome do backup é obrigatório' }, { status: 400 });
    }

    // Validar nome do ficheiro (segurança)
    const safeName = backupName.replace(/[^a-zA-Z0-9_\-\.]/g, '');
    const backupPath = path.join(BACKUP_DIR, safeName);

    // Verificar se o backup existe
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: 'Backup não encontrado' }, { status: 404 });
    }

    // Apagar backup
    fs.unlinkSync(backupPath);

    return NextResponse.json({
      success: true,
      message: 'Backup apagado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao apagar backup:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
