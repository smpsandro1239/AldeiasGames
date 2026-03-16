// User roles
export const SUPERADMIN = 'SUPERADMIN'
export const ORG_ADMIN = 'ORG_ADMIN'
export const VENDEDOR = 'VENDEDOR'
export const PLAYER = 'PLAYER'

export const ROLES = [SUPERADMIN, ORG_ADMIN, VENDEDOR, PLAYER] as const

export type UserRole = typeof ROLES[number]

// Role labels for display
export const ROLE_LABELS: Record<UserRole, string> = {
  [SUPERADMIN]: 'Super Administrador',
  [ORG_ADMIN]: 'Administrador da Organização',
  [VENDEDOR]: 'Vendedor',
  [PLAYER]: 'Jogador',
}

// Check if role has admin privileges
export const isAdmin = (role: string): boolean => {
  return role === SUPERADMIN || role === ORG_ADMIN
}
