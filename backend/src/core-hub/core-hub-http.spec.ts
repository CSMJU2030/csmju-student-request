import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';
import {
  CoreHubCallError,
  coreHubFailure,
  retryAfterSeconds,
} from './core-hub-http';

describe('Core Hub failure mapping', () => {
  it('maps Core Hub 401 to 401 UNAUTHORIZED', () => {
    const error = coreHubFailure(
      new CoreHubCallError('HTTP 401', 401),
    );

    expect(error).toBeInstanceOf(AppException);
    expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.retryAfterSec).toBeUndefined();
  });

  it('maps Core Hub 403 to 403 FORBIDDEN', () => {
    const error = coreHubFailure(
      new CoreHubCallError('HTTP 403', 403),
    );

    expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.retryAfterSec).toBeUndefined();
  });

  it("maps Core Hub 429 to 503 and preserves Retry-After", () => {
    const error = coreHubFailure(
      new CoreHubCallError('HTTP 429', 429, 45),
    );

    expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(error.code).toBe('SERVICE_UNAVAILABLE');
    expect(error.retryAfterSec).toBe(45);
  });

  it.each([
    ['timeout/no connection', new CoreHubCallError('timeout', 0)],
    ['Core Hub 500', new CoreHubCallError('HTTP 500', 500)],
    ['Core Hub 502', new CoreHubCallError('HTTP 502', 502)],
    ['malformed response', new Error('invalid response')],
  ])('maps %s to 503 with Retry-After 30', (_label, cause) => {
    const error = coreHubFailure(cause);

    expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(error.code).toBe('SERVICE_UNAVAILABLE');
    expect(error.retryAfterSec).toBe(30);
  });
});

describe('retryAfterSeconds', () => {
  it('parses delta-seconds', () => {
    expect(retryAfterSeconds('120')).toBe(120);
    expect(retryAfterSeconds(' 7 ')).toBe(7);
  });

  it('returns undefined for an invalid value', () => {
    expect(retryAfterSeconds('invalid')).toBeUndefined();
  });
});
