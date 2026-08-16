import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception.code === 'P2002') {
      const conflictError = new ConflictException('Ya existe un registro con ese valor');
      const conflictResponse = conflictError.getResponse();

      response.status(conflictError.getStatus()).json(
        typeof conflictResponse === 'string'
          ? {
              statusCode: conflictError.getStatus(),
              message: conflictResponse,
            }
          : conflictResponse,
      );
      return;
    }

    const fallbackStatus = HttpStatus.BAD_REQUEST;
    const fallbackException = new HttpException('Database request failed', fallbackStatus);
    const fallbackResponse = fallbackException.getResponse();

    response.status(fallbackStatus).json(
      typeof fallbackResponse === 'string'
        ? {
            statusCode: fallbackStatus,
            message: fallbackResponse,
          }
        : fallbackResponse,
    );
  }
}
