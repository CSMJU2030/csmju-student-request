import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { PermissionsGuard } from './auth/permissions.guard';
import { PrismaService } from './prisma.service';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { SystemController } from './system.controller';
import { MeController } from './me.controller';
import { PeopleService } from './core-hub/people.service';
import './core-hub/express-request';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AuthController,
    ServicesController,
    SystemController,
    MeController,
  ],
  providers: [
    PrismaService,
    AuthService,
    AuthGuard,
    PermissionsGuard,
    ServicesService,
    PeopleService,
  ],
})
export class AppModule {}
