import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    const connectionString = config.getOrThrow<string>('DATABASE_URL');
    const max = Number(config.get<string>('DATABASE_POOL_MAX')) || 5;
    super({ adapter: new PrismaPg({ connectionString, max }) });
  }
  async onModuleDestroy() { await this.$disconnect(); }
}
