import type { Role, Permission } from '@/types'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'properties:read',
    'properties:write',
    'properties:delete',
    'conversations:read',
    'conversations:write',
    'conversations:manage',
    'leads:read',
    'leads:write',
    'appointments:read',
    'appointments:write',
    'team:read',
    'team:manage',
    'settings:read',
    'settings:manage',
    'integrations:manage',
    'audit:read',
  ],
  admin: [
    'properties:read',
    'properties:write',
    'properties:delete',
    'conversations:read',
    'conversations:write',
    'conversations:manage',
    'leads:read',
    'leads:write',
    'appointments:read',
    'appointments:write',
    'team:read',
    'team:manage',
    'settings:read',
    'settings:manage',
    'audit:read',
  ],
  agent: [
    'properties:read',
    'conversations:read',
    'conversations:write',
    'leads:read',
    'leads:write',
    'appointments:read',
    'appointments:write',
  ],
  viewer: [
    'properties:read',
    'conversations:read',
    'leads:read',
    'appointments:read',
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}
