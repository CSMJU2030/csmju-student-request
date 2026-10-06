import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  coreHubFailure,
  getFromCoreHub,
} from './core-hub-http';

export interface Advisor {
  personCode: string;
  fullNameTh: string;
  universityEmail: string | null;
}

@Injectable()
export class PeopleService {
  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    return this.config
      .getOrThrow<string>('CORE_HUB_URL')
      .replace(/\/+$/, '');
  }

  async myAdvisors(token: string): Promise<Advisor[]> {
    let body: unknown;

    try {
      body = await getFromCoreHub(
        `${this.baseUrl}/api/v1/people/me`,
        token,
        5_000,
      );
    } catch (error) {
      throw coreHubFailure(error);
    }

    const envelope = (body ?? {}) as {
      success?: unknown;
      data?: unknown;
    };

    if (envelope.success === true && envelope.data === null) {
      return [];
    }

    if (
      envelope.success !== true ||
      typeof envelope.data !== 'object' ||
      envelope.data === null
    ) {
      throw coreHubFailure(
        new Error('GET /people/me returned an invalid response'),
      );
    }

    const advisors = (envelope.data as { advisors?: unknown }).advisors;

    if (!Array.isArray(advisors)) {
      return [];
    }

    return advisors.flatMap((value): Advisor[] => {
      if (
        typeof value !== 'object' ||
        value === null
      ) {
        return [];
      }

      const item = value as {
        personCode?: unknown;
        fullNameTh?: unknown;
        universityEmail?: unknown;
      };

      if (
        typeof item.personCode !== 'string' ||
        item.personCode.length === 0 ||
        typeof item.fullNameTh !== 'string' ||
        item.fullNameTh.length === 0
      ) {
        return [];
      }

      return [
        {
          personCode: item.personCode,
          fullNameTh: item.fullNameTh,
          universityEmail:
            typeof item.universityEmail === 'string' &&
            item.universityEmail.length > 0
              ? item.universityEmail
              : null,
        },
      ];
    });
  }
}
