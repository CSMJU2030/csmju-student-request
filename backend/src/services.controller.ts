import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { AuthGuard } from './auth.guard';
import { Permission } from './auth/permissions';
import { PermissionsGuard } from './auth/permissions.guard';
import { RequirePermissions } from './auth/require-permissions.decorator';
import { PrismaService } from './prisma.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
} from './services.dto';
import { ServicesService } from './services.service';

class ListServicesQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

class ReportDto {
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  message!: string;
}

@Controller('v1/services')
@UseGuards(AuthGuard, PermissionsGuard)
export class ServicesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly services: ServicesService,
  ) {}

  @Get()
  @RequirePermissions(Permission.SERVICE_READ)
  async list(@Query() query: ListServicesQueryDto) {
    const { page, limit } = query;

    const where = { isActive: true };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        orderBy: { title: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          code: true,
          title: true,
          description: true,
          lastVerifiedAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Post()
  @RequirePermissions(Permission.SERVICE_CREATE)
  async create(@Body() dto: CreateServiceDto) {
    const data = await this.services.create(dto);

    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  @RequirePermissions(Permission.SERVICE_READ)
  async detail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const data = await this.prisma.service.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        inputs: true,
        steps: {
          orderBy: { stepNo: 'asc' },
          include: {
            contacts: {
              include: {
                contactDirectory: {
                  select: {
                    name: true,
                    position: true,
                    location: true,
                    phone: true,
                    email: true,
                    sourceUrl: true,
                  },
                },
              },
            },
          },
        },
        documents: true,
        links: true,
        contacts: true,
      },
    });

    if (!data) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Service not found',
        },
      });
    }

    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  @RequirePermissions(Permission.SERVICE_UPDATE)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    const data = await this.services.update(id, dto);

    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  @RequirePermissions(Permission.SERVICE_DELETE)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const data = await this.services.remove(id);

    return {
      success: true,
      data,
    };
  }

  @Post(':id/reports')
  @RequirePermissions(Permission.REPORT_CREATE)
  async report(
    @Param('id', new ParseUUIDPipe({ version: '4' })) serviceId: string,
    @Body() dto: ReportDto,
  ) {
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!service) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Service not found',
        },
      });
    }

    const data = await this.prisma.informationReport.create({
      data: {
        serviceId,
        message: dto.message,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data,
    };
  }
}
