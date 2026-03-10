import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'custom.db');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

interface RouteParams {
    params: {
        filename: string;
    };
}

// DELETE - Apagar um backup
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { filename } = params;
        const filePath = path.join(BACKUP_DIR, filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Ficheiro não encontrado' }, { status: 404 });
        }

        fs.unlinkSync(filePath);
        return NextResponse.json({ success: true, message: 'Backup removido' });
    } catch (error) {
        console.error('Erro ao apagar backup:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

// POST - Restaurar um backup
// Use with caution!
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { filename } = params;
        const backupPath = path.join(BACKUP_DIR, filename);

        if (!fs.existsSync(backupPath)) {
            return NextResponse.json({ error: 'Ficheiro de backup não encontrado' }, { status: 404 });
        }

        // To restore, we copy the backup over the current DB
        // WARNING: This overwrites current data.
        // Ideally, we'd close connections first, but SQLite handles file replacement reasonably well 
        // if no active transactions are locked.
        fs.copyFileSync(backupPath, DB_PATH);

        return NextResponse.json({ success: true, message: 'Sistema restaurado com sucesso' });
    } catch (error) {
        console.error('Erro ao restaurar backup:', error);
        return NextResponse.json({ error: 'Erro interno durante restauro' }, { status: 500 });
    }
}

// GET - Download backup
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'super_admin') {
            return new Response('Não autorizado', { status: 403 });
        }

        const { filename } = params;
        const filePath = path.join(BACKUP_DIR, filename);

        if (!fs.existsSync(filePath)) {
            return new Response('Ficheiro não encontrado', { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new Response(fileBuffer, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Erro no download:', error);
        return new Response('Erro interno', { status: 500 });
    }
}
