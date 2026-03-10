import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        const targetUser = await db.user.findUnique({
            where: { id },
            include: {
                aldeia: { select: { id: true, nome: true } }
            }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
        }

        return NextResponse.json(targetUser);
    } catch (error) {
        console.error('Erro ao buscar utilizador:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const admin = await getUserFromRequest(request);
        if (!admin || admin.role !== 'super_admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        const body = await request.json();
        const { nome, email, password, role, aldeiaId } = body;

        const updateData: any = {
            nome,
            email,
            role,
            aldeiaId: aldeiaId || null
        };

        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        const updatedUser = await db.user.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Erro ao atualizar utilizador:', error);
        return NextResponse.json({ error: 'Erro ao atualizar utilizador' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const admin = await getUserFromRequest(request);
        if (!admin || admin.role !== 'super_admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        // Check if user is trying to delete themselves
        if (admin.id === id) {
            return NextResponse.json({ error: 'Não pode apagar a sua própria conta' }, { status: 400 });
        }

        await db.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao eliminar utilizador:', error);
        return NextResponse.json({ error: 'Erro ao eliminar utilizador' }, { status: 500 });
    }
}
