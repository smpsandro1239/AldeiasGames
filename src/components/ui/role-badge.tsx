import React from 'react';
import { Badge } from './badge';

/**
 * Badge colorido por role
 */
export function RoleBadge({ role }: { role: string }) {
  const colors: any = {
    super_admin: 'bg-red-100 text-red-700',
    aldeia_admin: 'bg-indigo-100 text-indigo-700',
    vendedor: 'bg-orange-100 text-orange-700',
    user: 'bg-green-100 text-green-700',
  };

  return (
    <Badge className={`${colors[role] || 'bg-gray-100'} border-none shadow-none`}>
      {role.replace('_', ' ')}
    </Badge>
  );
}
