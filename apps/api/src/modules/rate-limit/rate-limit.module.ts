import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { InMemoryRateLimiter } from './in-memory.rate-limiter';
import { RATE_LIMITER_TOKEN } from './rate-limiter.interface';
import { RateLimitInterceptor } from './rate-limit.interceptor';

@Global() // makes RATE_LIMITER_TOKEN injectable everywhere without re-importing
@Module({
  providers: [
    {
      provide: RATE_LIMITER_TOKEN,
      useClass: InMemoryRateLimiter,
      // to swap to Redis later: useClass: RedisRateLimiter
    },
    RateLimitInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
  ],
  exports: [RATE_LIMITER_TOKEN, RateLimitInterceptor],
})
export class RateLimitModule {}
