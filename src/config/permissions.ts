// src/config/permissions.ts

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'aldeia_admin',
  VENDEDOR: 'vendedor',
  PLAYER: 'player',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  // Super Admin permissions
  [ROLES.SUPER_ADMIN]: {
    // Organization management
    CREATE_ORG: true,
    READ_ORG: true,
    UPDATE_ORG: true,
    DELETE_ORG: true,
    // Event management
    CREATE_EVENT: true,
    READ_EVENT: true,
    UPDATE_EVENT: true,
    DELETE_EVENT: true,
    // User management
    CREATE_USER: true,
    READ_USER: true,
    UPDATE_USER: true,
    DELETE_USER: true,
    // Financial
    VIEW_FINANCIALS: true,
    MANAGE_PAYMENTS: true,
    // System
    VIEW_LOGS: true,
    MANAGE_SETTINGS: true,
  },

  // Organization Admin permissions
  [ROLES.ORG_ADMIN]: {
    // Organization management (only their own)
    CREATE_ORG: false,
    READ_ORG: true,
    UPDATE_ORG: true,
    DELETE_ORG: false,
    // Event management (only their org's events)
    CREATE_EVENT: true,
    READ_EVENT: true,
    UPDATE_EVENT: true,
    DELETE_EVENT: true,
    // User management (only org members)
    CREATE_USER: true,
    READ_USER: true,
    UPDATE_USER: true,
    DELETE_USER: false,
    // Financial (only their org's)
    VIEW_FINANCIALS: true,
    MANAGE_PAYMENTS: true,
    // System
    VIEW_LOGS: false,
    MANAGE_SETTINGS: false,
  },

  // Vendedor permissions
  [ROLES.VENDEDOR]: {
    // Organization management
    CREATE_ORG: false,
    READ_ORG: false,
    UPDATE_ORG: false,
    DELETE_ORG: false,
    // Event management (only assigned events)
    CREATE_EVENT: false,
    READ_EVENT: true,
    UPDATE_EVENT: false,
    DELETE_EVENT: false,
    // User management
    CREATE_USER: false,
    READ_USER: false,
    UPDATE_USER: false,
    DELETE_USER: false,
    // Sales
    CREATE_SALE: true,
    READ_SALE: true,
    UPDATE_SALE: false,
    DELETE_SALE: false,
    // Financial (only their sales)
    VIEW_FINANCIALS: false,
    MANAGE_PAYMENTS: false,
    // System
    VIEW_LOGS: false,
    MANAGE_SETTINGS: false,
  },

  // Player permissions
  [ROLES.PLAYER]: {
    // Organization management
    CREATE_ORG: false,
    READ_ORG: false,
    UPDATE_ORG: false,
    DELETE_ORG: false,
    // Event management (only participating)
    CREATE_EVENT: false,
    READ_EVENT: true,
    UPDATE_EVENT: false,
    DELETE_EVENT: false,
    // User management
    CREATE_USER: false,
    READ_USER: false,
    UPDATE_USER: false,
    DELETE_USER: false,
    // Participation
    PARTICIPATE_IN_EVENT: true,
    VIEW_HISTORY: true,
    // Financial (only their own)
    VIEW_FINANCIALS: false,
    MANAGE_PAYMENTS: false,
    // System
    VIEW_LOGS: false,
    MANAGE_SETTINGS: false,
  },
} as const;

export type Permissions = typeof PERMISSIONS[Role];

export function getPermissionsForRole(role: Role): Permissions {
  return PERMISSIONS[role];
}

export function hasPermission(role: Role, permission: keyof Permissions): boolean {
  const permissions = PERMISSIONS[role];
  return permissions[permission] ?? false;
}