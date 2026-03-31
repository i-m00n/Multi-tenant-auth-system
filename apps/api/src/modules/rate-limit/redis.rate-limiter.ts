import { Injectable } from '@nestjs/common';
import { IRateLimiter, RateLimitResult } from './rate-limiter.interface';

@Injectable()
export class RedisRateLimiter implements IRateLimiter {
  async consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    return Promise.reject(
      new Error(
        `RedisRateLimiter.consume(${key}, ${limit}, ${windowSeconds}) not implemented. `,
      ),
    );
  }

  async reset(key: string): Promise<void> {
    return Promise.reject(
      new Error(`RedisRateLimiter.reset(${key}) not implemented.`),
    );
  }
}
