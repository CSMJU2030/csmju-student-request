import { SubsystemRole } from './core-hub-identity';

export const CORE_ROLE_TO_SUBSYSTEM_ROLE: Readonly<
  Record<string, SubsystemRole>
> = Object.freeze({
  student: SubsystemRole.USER,
  alumni: SubsystemRole.USER,
  staff: SubsystemRole.STAFF,
  lecturer: SubsystemRole.USER,
  admin: SubsystemRole.USER,
});

export function mapCoreRoleToSubsystemRole(
  coreRole: string | undefined,
): SubsystemRole | null {
  if (typeof coreRole !== 'string') {
    return null;
  }

  return (
    CORE_ROLE_TO_SUBSYSTEM_ROLE[coreRole.trim().toLowerCase()] ?? null
  );
}