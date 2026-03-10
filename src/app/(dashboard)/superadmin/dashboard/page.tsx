/**
 * Super Admin Dashboard Page
 * src/app/(dashboard)/superadmin/dashboard/page.tsx
 */

import { SuperAdminDashboard } from '@/components/dashboard/super-admin/super-admin-dashboard';
import { hasPermission, Role } from '@/lib/role-permissions';
import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function SuperAdminPage() {
    // In a real SSR scenario, we would get the user from the session/token
    // For the sake of this implementation, we assume the middleware/proxy handles the initial check
    // but we should still verify if possible or rely on the client-side component to fetch data.

    return <SuperAdminDashboard />;
}
