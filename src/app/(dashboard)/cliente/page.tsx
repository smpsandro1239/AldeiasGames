/**
 * Cliente Dashboard Page
 * src/app/(dashboard)/cliente/page.tsx
 */

import { redirect } from 'next/navigation';
import { ClienteDashboard } from '@/components/dashboard/cliente/cliente-dashboard';
import { hasPermission, Role } from '@/lib/role-permissions';

export default async function ClientePage() {
  // Get user role from session/cookie
  const userRole: Role = 'CLIENTE';
  
  // Check permission
  if (!hasPermission(userRole, 'play_games')) {
    redirect('/dashboard');
  }

  return <ClienteDashboard />;
}
