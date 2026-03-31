export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
  retryAfter?: number;
}

export interface IRateLimiter {
  consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

export const RATE_LIMITER_TOKEN = 'RATE_LIMITER';
