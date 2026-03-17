// src/lib/middleware/permissionsMiddleware.ts
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ROLES, hasPermission } from '@/config/permissions';

export async function permissionsMiddleware(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return null; // No user, let main middleware handle it
  }

  const { pathname } = request.nextUrl;

  // Check specific permissions for different roles
  if (user.role === ROLES.SUPER_ADMIN) {
    // Super Admin has all permissions
    return null;
  }

  // Organization Admin specific permissions
  if (user.role === ROLES.ORG_ADMIN) {
    // Check if user is trying to create an org (should be denied)
    if (pathname.startsWith('/api/orgs') && pathname.includes('create')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para criar organizações' }
      };
    }

    // Check if user is trying to delete an org (should be denied)
    if (pathname.startsWith('/api/orgs') && pathname.includes('delete')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para eliminar organizações' }
      };
    }

    // Check if user is trying to manage users (only org members)
    if (pathname.startsWith('/api/users') && !pathname.includes('org')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para gerir utilizadores' }
      };
    }

    // Check if user is trying to view logs (should be denied)
    if (pathname.startsWith('/api/logs')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para ver logs' }
      };
    }

    // Check if user is trying to manage settings (should be denied)
    if (pathname.startsWith('/api/settings')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para gerir configurações' }
      };
    }
  }

  // Vendedor specific permissions
  if (user.role === ROLES.VENDEDOR) {
    // Check if user is trying to create org (should be denied)
    if (pathname.startsWith('/api/orgs')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para gerir organizações' }
      };
    }

    // Check if user is trying to manage users (should be denied)
    if (pathname.startsWith('/api/users')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para gerir utilizadores' }
      };
    }

    // Check if user is trying to view financials (should be denied)
    if (pathname.startsWith('/api/financas')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para ver dados financeiros' }
      };
    }

    // Check if user is trying to view logs (should be denied)
    if (pathname.startsWith('/api/logs')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para ver logs' }
      };
    }

    // Check if user is trying to manage settings (should be denied)
    if (pathname.startsWith('/api/settings')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para gerir configurações' }
      };
    }
  }

  // Player specific permissions
  if (user.role === ROLES.PLAYER) {
    // Check if user is trying to create org (should be denied)
    if (pathname.startsWith('/api/orgs')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para gerir organizações' }
      };
    }

    // Check if user is trying to manage users (should be denied)
    if (pathname.startsWith('/api/users')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para gerir utilizadores' }
      };
    }

    // Check if user is trying to create sales (should be denied)
    if (pathname.startsWith('/api/vendas')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para fazer vendas' }
      };
    }

    // Check if user is trying to view financials (should be denied)
    if (pathname.startsWith('/api/financas')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para ver dados financeiros' }
      };
    }

    // Check if user is trying to view logs (should be denied)
    if (pathname.startsWith('/api/logs')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para ver logs' }
      };
    }

    // Check if user is trying to manage settings (should be denied)
    if (pathname.startsWith('/api/settings')) {
      return {
        status: 403,
        json: { error: 'Não tem permissão para gerir configurações' }
      };
    }
  }

  return null; // No specific permission checks failed, let request proceed
}