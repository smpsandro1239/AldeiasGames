// src/hooks/usePermissions.ts
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/lib/contexts/UserContext';
import { getPermissionsForRole } from '@/config/permissions';

export function usePermissions() {
  const { user } = useContext(UserContext);
  const [permissions, setPermissions] = useState<any>({});

  useEffect(() => {
    if (user && user.role) {
      setPermissions(getPermissionsForRole(user.role as Role));
    }
  }, [user]);

  return {
    permissions,
    hasPermission: (permission: string) => {
      if (!user || !user.role) return false;
      return permissions[permission] || false;
    },
    canCreateOrg: () => hasPermission('CREATE_ORG'),
    canReadOrg: () => hasPermission('READ_ORG'),
    canUpdateOrg: () => hasPermission('UPDATE_ORG'),
    canDeleteOrg: () => hasPermission('DELETE_ORG'),
    canCreateEvent: () => hasPermission('CREATE_EVENT'),
    canReadEvent: () => hasPermission('READ_EVENT'),
    canUpdateEvent: () => hasPermission('UPDATE_EVENT'),
    canDeleteEvent: () => hasPermission('DELETE_EVENT'),
    canCreateSale: () => hasPermission('CREATE_SALE'),
    canReadSale: () => hasPermission('READ_SALE'),
    canParticipate: () => hasPermission('PARTICIPATE_IN_EVENT'),
    canViewHistory: () => hasPermission('VIEW_HISTORY'),
    canViewFinancals: () => hasPermission('VIEW_FINANCIALS'),
    canManagePayments: () => hasPermission('MANAGE_PAYMENTS'),
    canViewLogs: () => hasPermission('VIEW_LOGS'),
    canManageSettings: () => hasPermission('MANAGE_SETTINGS'),
  };
}