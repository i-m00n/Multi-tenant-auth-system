import { SetMetadata } from '@nestjs/common';
import { TenantRequest } from 'src/types/tenant-request.interface';

export type KeyStrategy = (req: TenantRequest) => string;

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
  keyStrategy: KeyStrategy;
}

export const RATE_LIMIT_KEY = 'rate_limit_options';

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

// for login - keyed by tenant + email from body
// attacker rotating IPs won't bypass this
export const loginKeyStrategy: KeyStrategy = (req) => {
  const tenantId = req.tenant?.id ?? 'unknown';
  const email = (req.body as { email?: string })?.email ?? 'unknown';
  return `login:${tenantId}:${email}`;
};

// for register - keyed by tenant + IP (as there is no email/user yet)
export const registerKeyStrategy: KeyStrategy = (req) => {
  const tenantId = req.tenant?.id ?? 'unknown';
  const ip = req.ip ?? 'unknown';
  return `register:${tenantId}:${ip}`;
};

// for refresh — keyed by tenant + userId from JWT (already in req.user via cookie decode)
// falls back to IP if user not yet resolved
export const refreshKeyStrategy: KeyStrategy = (req) => {
  const tenantId = req.tenant?.id ?? 'unknown';
  const userId = req.user?.id ?? 'unknown';
  return `refresh:${tenantId}:${userId}`;
};

// for general authenticated endpoints
export const apiKeyStrategy: KeyStrategy = (req) => {
  const tenantId = req.tenant?.id ?? 'unknown';
  const userId = req.user?.id ?? 'anonymous';
  return `api:${tenantId}:${userId}`;
};
