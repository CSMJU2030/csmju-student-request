import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    readonly code: string,
    message: string,
    status: HttpStatus,
    readonly retryAfterSec?: number,
  ) {
    super(
      {
        success: false,
        error: { code, message },
      },
      status,
    );
  }

  static unauthorized(message: string): AppException {
    return new AppException(
      'UNAUTHORIZED',
      message,
      HttpStatus.UNAUTHORIZED,
    );
  }

  static forbidden(message: string): AppException {
    return new AppException(
      'FORBIDDEN',
      message,
      HttpStatus.FORBIDDEN,
    );
  }

  static serviceUnavailable(
    message: string,
    retryAfterSec: number,
  ): AppException {
    return new AppException(
      'SERVICE_UNAVAILABLE',
      message,
      HttpStatus.SERVICE_UNAVAILABLE,
      retryAfterSec,
    );
  }
}
