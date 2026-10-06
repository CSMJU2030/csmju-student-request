import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';
import { PeopleService } from './core-hub/people.service';

@Controller('v1/me')
@UseGuards(AuthGuard)
export class MeController {
  constructor(private readonly people: PeopleService) {}

  @Get('advisors')
  async advisors(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'no-store');

    const token = req.coreHubAccessToken;

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid token',
        },
      });
    }

    const data = await this.people.myAdvisors(token);

    return {
      success: true,
      data,
    };
  }
}
