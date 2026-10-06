import {
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CoreHubIdentity, SubsystemRole } from './core-hub-identity';
import { Permission } from './permissions';
import { PermissionsGuard } from './permissions.guard';

function createContext(
  user: CoreHubIdentity,
): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
  } as unknown as ExecutionContext;
}

function createUser(
  subsystemRole: SubsystemRole,
): CoreHubIdentity {
  return {
    id: 'test-user',
    email: 'test@example.com',
    coreRole: subsystemRole === SubsystemRole.STAFF
      ? 'staff'
      : 'student',
    subsystemRole,
  };
}

describe('PermissionsGuard', () => {
  it('allows STAFF with service:create permission', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([
        Permission.SERVICE_CREATE,
      ]),
    } as unknown as Reflector;

    const guard = new PermissionsGuard(reflector);
    const context = createContext(
      createUser(SubsystemRole.STAFF),
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('returns 403 when USER attempts service:create', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([
        Permission.SERVICE_CREATE,
      ]),
    } as unknown as Reflector;

    const guard = new PermissionsGuard(reflector);
    const context = createContext(
      createUser(SubsystemRole.USER),
    );

    expect(() => guard.canActivate(context)).toThrow(
      ForbiddenException,
    );

    try {
      guard.canActivate(context);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as ForbiddenException).getStatus()).toBe(403);
    }
  });
});
