import { Injectable } from '@nestjs/common';
import { IRateLimiter, RateLimitResult } from './rate-limiter.interface';

interface WindowEntry {
  timestamps: number[]; // unix ms timestamps of each request in current window
}

@Injectable()
export class InMemoryRateLimiter implements IRateLimiter {
  // key - list of request timestamps within the current window
  private readonly store = new Map<string, WindowEntry>();

  // cleanup runs every 5 minutes to prevent unbounded memory growth
  constructor() {
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const nowMs = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = nowMs - windowMs;

    // get or create entry
    const entry = this.store.get(key) ?? { timestamps: [] };

    // drop timestamps outside the sliding window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    const count = entry.timestamps.length;

    if (count >= limit) {
      // blocked — oldest timestamp tells us when the window will free up
      const oldestTs = entry.timestamps[0];
      const resetAt = Math.ceil((oldestTs + windowMs) / 1000);
      const retryAfter = Math.ceil((oldestTs + windowMs - nowMs) / 1000);

      this.store.set(key, entry);

      return {
        allowed: false,
        remaining: 0,
        limit,
        resetAt,
        retryAfter: Math.max(retryAfter, 1),
      };
    }

    // allowed — record this request
    entry.timestamps.push(nowMs);
    this.store.set(key, entry);

    // resetAt = when the oldest request in the window expires
    const oldestTs = entry.timestamps[0];
    const resetAt = Math.ceil((oldestTs + windowMs) / 1000);

    return Promise.resolve({
      allowed: true,
      remaining: limit - entry.timestamps.length,
      limit,
      resetAt,
    });
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  private cleanup(): void {
    const nowMs = Date.now();

    for (const [key, entry] of this.store.entries()) {
      // if all timestamps are older than 1 hour, clear the entry entirely
      const hasRecent = entry.timestamps.some(
        (ts) => nowMs - ts < 60 * 60 * 1000,
      );
      if (!hasRecent) {
        this.store.delete(key);
      }
    }
  }
}
