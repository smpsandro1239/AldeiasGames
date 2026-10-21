import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { SUPERADMIN, ORG_ADMIN } from '@/constants/roles';

// Helper de autentização/autorização (usa o sistema JWT próprio do projeto,
// compatível com next-auth v5 — getServerSession não existe nesta versão).
async function requireAdmin(request: NextRequest): Promise<{ user: any } | NextResponse> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== SUPERADMIN && user.role !== ORG_ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return { user };
}

function isErrorResponse(v: any): v is NextResponse {
  return v instanceof NextResponse;
}

// GET /api/organization/members - List members
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) return authResult;

    const members = await prisma.organizationMember.findMany({
      include: {
        user: true,
        organization: true
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/organization/members - Create member
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) return authResult;

    const { email, name, role, organizationId } = await request.json();

    // Validation
    if (!email || !name || !role || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, role, organizationId' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be ADMIN or MEMBER' },
        { status: 400 }
      );
    }

    // Check if user exists by email
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Create user if doesn't exist (for invitation flow)
      user = await prisma.user.create({
        data: {
          email,
          name,
          // In real app, you'd set a random password and send reset link
          password: 'temp_' + Math.random().toString(36).substring(2, 12),
          emailVerified: new Date(),
        },
      });
    }

    // Check if already member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      );
    }

    // Create organization member
    const member = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId,
        role,
      },
      include: {
        user: true,
        organization: true,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/organization/members - Update member role (?id=...)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) return authResult;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const { role } = await request.json();

    if (!role || !['ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role (ADMIN or MEMBER) required' },
        { status: 400 }
      );
    }

    const member = await prisma.organizationMember.update({
      where: { id: String(id) },
      data: { role },
      include: {
        user: true,
        organization: true,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/organization/members - Remove member (?id=...)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) return authResult;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    await prisma.organizationMember.delete({
      where: { id: String(id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
