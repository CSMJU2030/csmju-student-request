import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard';
import type { CoreHubIdentity } from './auth/core-hub-identity';

@Controller()
export class SystemController {
  constructor(private readonly config: ConfigService) {}

  @Get('health')
  health() {
    return {
      success: true,
      data: {
        service: this.config.getOrThrow<string>('SUBSYSTEM_ID'),
        status: 'ok',
      },
    };
  }

  @Get('v1/me')
  @UseGuards(AuthGuard)
  me(@Req() req: Request & { user?: CoreHubIdentity }) {
    const user = req.user!;

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        coreRole: user.coreRole,
        subsystemRole: user.subsystemRole,
        session: {
          expiresAt:
            typeof user.exp === 'number'
              ? new Date(user.exp * 1000).toISOString()
              : null,
        },
      },
    };
  }
}