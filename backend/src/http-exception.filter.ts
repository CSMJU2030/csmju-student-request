import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Response } from 'express';
import { AppException } from './app.exception';
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res=host.switchToHttp().getResponse<Response>(); const status=exception instanceof HttpException?exception.getStatus():500;
    const body=exception instanceof HttpException?exception.getResponse():null;

    if (
      status === 429 ||
      status === 503
    ) {
      const retryAfter =
        exception instanceof AppException &&
        exception.retryAfterSec !== undefined
          ? exception.retryAfterSec
          : 30;

      res.setHeader(
        'Retry-After',
        String(Math.max(1, Math.ceil(retryAfter))),
      );
    }

    if(typeof body==='object' && body && 'success' in body) return res.status(status).json(body);
    const code=status===400?'VALIDATION_ERROR':status===401?'UNAUTHORIZED':status===403?'FORBIDDEN':status===404?'NOT_FOUND':status===409?'CONFLICT':status===429?'RATE_LIMITED':status===503?'SERVICE_UNAVAILABLE':'INTERNAL_ERROR';
    const message=status>=500?'Internal server error':exception instanceof HttpException?exception.message:'Internal server error';
    return res.status(status).json({success:false,error:{code,message}});
  }
}
