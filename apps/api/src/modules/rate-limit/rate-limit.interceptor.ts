import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Response } from 'express';
import * as rateLimiterInterface from './rate-limiter.interface';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../../common/decorators/rate-limit.decorator';
import { TenantRequest } from '../../types/tenant-request.interface';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(rateLimiterInterface.RATE_LIMITER_TOKEN)
    private rateLimiter: rateLimiterInterface.IRateLimiter,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // no @RateLimit decorator on this route - skip
    if (!options) return next.handle();

    const req = context.switchToHttp().getRequest<TenantRequest>();
    const res = context.switchToHttp().getResponse<Response>();

    const key = options.keyStrategy(req);
    const result = await this.rateLimiter.consume(
      key,
      options.limit,
      options.windowSeconds,
    );

    res.set('x-rate-limit', result.limit.toString());
    res.set('x-rate-remaining', result.remaining.toString());
    res.set('x-rate-reset', result.resetAt.toString());

    if (!result.allowed) {
      res.set('retry-after', result.retryAfter!.toString());

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          retryAfter: result.retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle();
  }
}
