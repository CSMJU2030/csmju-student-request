import { ArgumentsHost } from '@nestjs/common';
import { AppException } from './app.exception';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter Retry-After', () => {
  function createHost() {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;

    return { host, response };
  }

  it('sends AppException Retry-After with a 503 response', () => {
    const { host, response } = createHost();

    new HttpExceptionFilter().catch(
      AppException.serviceUnavailable(
        'Core Hub is unavailable right now',
        45,
      ),
      host,
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'Retry-After',
      '45',
    );
    expect(response.status).toHaveBeenCalledWith(503);
  });

  it('uses Retry-After 30 for a bare 503', () => {
    const { host, response } = createHost();

    new HttpExceptionFilter().catch(
      new AppException(
        'SERVICE_UNAVAILABLE',
        'Service unavailable',
        503,
      ),
      host,
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'Retry-After',
      '30',
    );
    expect(response.status).toHaveBeenCalledWith(503);
  });

  it('does not send Retry-After for 401', () => {
    const { host, response } = createHost();

    new HttpExceptionFilter().catch(
      AppException.unauthorized('Sign in again'),
      host,
    );

    expect(response.setHeader).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(401);
  });
});
