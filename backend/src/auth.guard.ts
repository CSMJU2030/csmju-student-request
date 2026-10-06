import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import type {
  CoreHubIdentity,
  CoreHubTokenPayload,
} from './auth/core-hub-identity';
import { mapCoreRoleToSubsystemRole } from './auth/role-mapping';

function cookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie ?? '';

  for (const item of raw.split(';')) {
    const [key, ...value] = item.trim().split('=');

    if (key === name) {
      return decodeURIComponent(value.join('='));
    }
  }

  return undefined;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: CoreHubIdentity }>();

    const bearer = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    const token = bearer ?? cookie(req, this.auth.cookieName());

    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const payload = (await this.auth.verify(token)) as CoreHubTokenPayload;

    const subsystemRole = mapCoreRoleToSubsystemRole(payload.role);

    // JWT ผ่านแล้ว แต่ role ไม่มีสิทธิ์เข้า subsystem = 403 ไม่ใช่ 401
    if (!subsystemRole) {
      throw new ForbiddenException(
        'Your Core Hub role has no access to this subsystem',
      );
    }

    const identity: CoreHubIdentity = {
      id: payload.sub,
      email: payload.email ?? '',
      coreRole: payload.role as string,
      sessionId: payload.sid,
      subsystemRole,
      exp: payload.exp,
    };

    req.user = identity;

    // Request-scoped only: used when this backend calls an allowed Core Hub
    // endpoint on behalf of the currently authenticated user. Never log/store it.
    req.coreHubAccessToken = token;

    return true;
  }
}