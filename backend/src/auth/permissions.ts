import { SubsystemRole } from './core-hub-identity';

export enum Permission {
  SERVICE_READ = 'service:read',
  SERVICE_CREATE = 'service:create',
  SERVICE_UPDATE = 'service:update',
  SERVICE_DELETE = 'service:delete',
  REPORT_CREATE = 'report:create',
}

const USER_PERMISSIONS: Permission[] = [
  Permission.SERVICE_READ,
  Permission.REPORT_CREATE,
];

const STAFF_PERMISSIONS: Permission[] = [
  Permission.SERVICE_READ,
  Permission.SERVICE_CREATE,
  Permission.SERVICE_UPDATE,
  Permission.SERVICE_DELETE,
  Permission.REPORT_CREATE,
];

export const ROLE_PERMISSIONS: Readonly<
  Record<SubsystemRole, readonly Permission[]>
> = Object.freeze({
  [SubsystemRole.USER]: Object.freeze(USER_PERMISSIONS),
  [SubsystemRole.STAFF]: Object.freeze(STAFF_PERMISSIONS),
});

export function can(
  role: SubsystemRole,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAny(
  role: SubsystemRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => can(role, permission));
}
