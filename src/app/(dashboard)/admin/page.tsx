/**
 * Admin Dashboard Page
 * src/app/(dashboard)/admin/page.tsx
 */

import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/dashboard/admin/admin-dashboard';
import { hasPermission, Role } from '@/lib/role-permissions';

export default async function AdminPage() {
  // Get user role from session/cookie
  // In production, get from actual auth session
  const userRole: Role = 'ADMIN';
  
  // Check permission - admin can access tenant dashboard
  if (!hasPermission(userRole, 'view_tenant_dashboard')) {
    redirect('/dashboard');
  }

  return <AdminDashboard />;
}
