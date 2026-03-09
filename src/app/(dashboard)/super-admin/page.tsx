/**
 * Super Admin Dashboard Page
 * src/app/(dashboard)/super-admin/page.tsx
 */

import { redirect } from 'next/navigation';
import { SuperAdminDashboard } from '@/components/dashboard/super-admin/super-admin-dashboard';
import { hasPermission, Role } from '@/lib/role-permissions';

// Server component - protects the route
export default async function SuperAdminPage() {
  // Get user role from session/cookie (implement with your auth)
  // For now, allow access - in production, check actual session
  const userRole: Role = 'SUPER_ADMIN';
  
  // Check permission
  if (!hasPermission(userRole, 'view_global_dashboard')) {
    redirect('/dashboard');
  }

  return <SuperAdminDashboard />;
}
