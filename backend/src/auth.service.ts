import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
} from 'jose';
import type { CoreHubTokenPayload } from './auth/core-hub-identity';

const REQUIRED_ALGORITHM = 'RS256';
const MAX_TOKEN_LIFETIME_SEC = 900;
const TOKEN_LIFETIME_TOLERANCE_SEC = 60;

@Injectable()
export class AuthService {
  private readonly jwks;

  constructor(private readonly config: ConfigService) {
    this.jwks = createRemoteJWKSet(
      new URL(config.getOrThrow<string>('CORE_HUB_JWKS_URL')),
      {
        cooldownDuration: Number(
          config.get('JWKS_MIN_REFRESH_INTERVAL_MS') ?? 30000,
        ),
        cacheMaxAge: Number(
          config.get('JWKS_CACHE_TTL_MS') ?? 600000,
        ),
        timeoutDuration: Number(
          config.get('JWKS_REQUEST_TIMEOUT_MS') ?? 5000,
        ),
      },
    );
  }

  cookieName(): string {
    return `${this.config
      .getOrThrow<string>('SUBSYSTEM_ID')
      .replaceAll('-', '_')}_access_token`;
  }

  stateCookieName(): string {
    return `${this.config
      .getOrThrow<string>('SUBSYSTEM_ID')
      .replaceAll('-', '_')}_sso_state`;
  }

  async verify(token: string): Promise<CoreHubTokenPayload> {
    try {
      // Steps 1-3: token, header, RS256 and kid.
      if (typeof token !== 'string' || token.trim().length === 0) {
        throw new Error('missing token');
      }

      const header = decodeProtectedHeader(token);

      if (header.alg !== REQUIRED_ALGORITHM) {
        throw new Error('unsupported algorithm');
      }

      if (typeof header.kid !== 'string' || header.kid.length === 0) {
        throw new Error('missing kid');
      }

      // Steps 4-7: JWKS key resolution, signature, issuer,
      // audience and expiration.
      const { payload } = await jwtVerify(token, this.jwks, {
        algorithms: [REQUIRED_ALGORITHM],
        issuer: this.config.getOrThrow<string>('CORE_HUB_ISSUER'),
        audience: this.config.getOrThrow<string>('CORE_HUB_AUDIENCE'),
        clockTolerance: Number(
          this.config.get('JWT_CLOCK_TOLERANCE_SEC') ?? 5,
        ),
        requiredClaims: ['exp'],
      });

      // Step 8: usable subject.
      if (
        typeof payload.sub !== 'string' ||
        payload.sub.trim().length === 0
      ) {
        throw new Error('missing subject');
      }

      // Step 9: access-token lifetime.
      if (
        typeof payload.iat !== 'number' ||
        typeof payload.exp !== 'number'
      ) {
        throw new Error('missing token lifetime claims');
      }

      if (
        payload.exp - payload.iat >
        MAX_TOKEN_LIFETIME_SEC + TOKEN_LIFETIME_TOLERANCE_SEC
      ) {
        throw new Error('token lifetime exceeded');
      }

      // Step 10: when azp exists, it must name this subsystem.
      if (
        payload.azp !== undefined &&
        payload.azp !==
          this.config.getOrThrow<string>('SUBSYSTEM_ID')
      ) {
        throw new Error('invalid azp');
      }

      return payload as unknown as CoreHubTokenPayload;
    } catch {
      // Do not expose verification details to the client.
      throw new UnauthorizedException('Missing or invalid token');
    }
  }
}
