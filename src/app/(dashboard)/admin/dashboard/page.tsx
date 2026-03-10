/**
 * Admin Dashboard Page
 * src/app/(dashboard)/admin/dashboard/page.tsx
 */

import { AldeiaAdminDashboard } from '@/features/AldeiaAdminDashboard';
import { getUserFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
    // Ideally get user from session here to pass aldeiaId
    // For now the component handles it via its own logic or we pass defaults
    return <AldeiaAdminDashboard aldeiaId="" aldeiaNome="Administração" />;
}
