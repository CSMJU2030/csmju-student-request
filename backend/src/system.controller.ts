import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard';
import type { CoreHubIdentity } from './auth/core-hub-identity';

@Controller()
export class SystemController {
  @Get('health')
  health() {
    return {
      success: true,
      data: {
        service: 'csmju-student-request',
        status: 'ok',
      },
    };
  }

  @Get('v1/me')
  @UseGuards(AuthGuard)
  me(@Req() req: Request & { user?: CoreHubIdentity }) {
    const user = req.user;

    if (!user) {
      return;
    }

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