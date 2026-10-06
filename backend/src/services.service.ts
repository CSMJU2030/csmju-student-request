import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from './generated/prisma/client';
import { PrismaService } from './prisma.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
} from './services.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        return tx.service.create({
          data: {
            code: dto.code,
            title: dto.title,
            description: dto.description,
            lastVerifiedAt: dto.lastVerifiedAt
              ? new Date(dto.lastVerifiedAt)
              : null,

            inputs: {
              create: dto.inputs.map((input) => ({
                label: input.label,
                description: input.description,
                isRequired: input.isRequired,
              })),
            },

            steps: {
              create: dto.steps.map((step) => ({
                stepNo: step.stepNo,
                title: step.title,
                description: step.description,
                requiresSignature: step.requiresSignature,
                location: step.location,
              })),
            },

            documents: {
              create: dto.documents.map((document) => ({
                name: document.name,
                description: document.description,
                isRequired: document.isRequired,
              })),
            },

            links: {
              create: dto.links.map((link) => ({
                title: link.title,
                url: link.url,
                linkType: link.linkType,
              })),
            },

            contacts: {
              create: dto.contacts.map((contact) => ({
                name: contact.name,
                channel: contact.channel,
                value: contact.value,
              })),
            },
          },
          include: this.detailInclude,
        });
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: { id: true },
    });

    if (!existing) {
      throw this.notFound();
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.inputs !== undefined) {
          await tx.serviceInput.deleteMany({
            where: { serviceId: id },
          });
        }

        if (dto.steps !== undefined) {
          await tx.serviceStep.deleteMany({
            where: { serviceId: id },
          });
        }

        if (dto.documents !== undefined) {
          await tx.serviceDocument.deleteMany({
            where: { serviceId: id },
          });
        }

        if (dto.links !== undefined) {
          await tx.serviceLink.deleteMany({
            where: { serviceId: id },
          });
        }

        if (dto.contacts !== undefined) {
          await tx.serviceContact.deleteMany({
            where: { serviceId: id },
          });
        }

        return tx.service.update({
          where: { id },
          data: {
            ...(dto.code !== undefined && { code: dto.code }),
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.description !== undefined && {
              description: dto.description,
            }),
            ...(dto.lastVerifiedAt !== undefined && {
              lastVerifiedAt: new Date(dto.lastVerifiedAt),
            }),

            ...(dto.inputs !== undefined && {
              inputs: {
                create: dto.inputs.map((input) => ({
                  label: input.label,
                  description: input.description,
                  isRequired: input.isRequired,
                })),
              },
            }),

            ...(dto.steps !== undefined && {
              steps: {
                create: dto.steps.map((step) => ({
                  stepNo: step.stepNo,
                  title: step.title,
                  description: step.description,
                  requiresSignature: step.requiresSignature,
                  location: step.location,
                })),
              },
            }),

            ...(dto.documents !== undefined && {
              documents: {
                create: dto.documents.map((document) => ({
                  name: document.name,
                  description: document.description,
                  isRequired: document.isRequired,
                })),
              },
            }),

            ...(dto.links !== undefined && {
              links: {
                create: dto.links.map((link) => ({
                  title: link.title,
                  url: link.url,
                  linkType: link.linkType,
                })),
              },
            }),

            ...(dto.contacts !== undefined && {
              contacts: {
                create: dto.contacts.map((contact) => ({
                  name: contact.name,
                  channel: contact.channel,
                  value: contact.value,
                })),
              },
            }),
          },
          include: this.detailInclude,
        });
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.service.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw this.notFound();
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        code: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  private readonly detailInclude = {
    inputs: true,
    steps: {
      orderBy: {
        stepNo: 'asc' as const,
      },
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
  };

  private notFound(): NotFoundException {
    return new NotFoundException({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Service not found',
      },
    });
  }

  private handleWriteError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Service contains duplicate unique data',
        },
      });
    }

    throw error;
  }
}
