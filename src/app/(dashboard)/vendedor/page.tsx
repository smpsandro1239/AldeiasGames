/**
 * Vendedor Dashboard Page
 * src/app/(dashboard)/vendedor/page.tsx
 */

import { redirect } from 'next/navigation';
import { VendedorDashboard } from '@/components/dashboard/vendedor/vendedor-dashboard';
import { hasPermission, Role } from '@/lib/role-permissions';

export default async function VendedorPage() {
  // Get user role from session/cookie
  const userRole: Role = 'VENDEDOR';
  
  // Check permission
  if (!hasPermission(userRole, 'sell')) {
    redirect('/dashboard');
  }

  return <VendedorDashboard />;
}
