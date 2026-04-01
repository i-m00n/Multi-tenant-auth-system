import { BaseEvent } from './base.event';

export class LoginSuccessEvent extends BaseEvent {
  userId: string;

  constructor(data: Omit<LoginSuccessEvent, 'occurredAt'>) {
    super(data);
  }
}

export class LoginFailedEvent extends BaseEvent {
  email: string;
  reason: string;

  constructor(data: Omit<LoginFailedEvent, 'occurredAt'>) {
    super(data);
  }
}

export class LogoutEvent extends BaseEvent {
  userId: string;
  familyId: string;
  logoutAll: boolean;

  constructor(data: Omit<LogoutEvent, 'occurredAt'>) {
    super(data);
  }
}

export class TokenRefreshedEvent extends BaseEvent {
  userId: string;
  familyId: string;

  constructor(data: Omit<TokenRefreshedEvent, 'occurredAt'>) {
    super(data);
  }
}

export class TokenReplayDetectedEvent extends BaseEvent {
  familyId: string;

  constructor(data: Omit<TokenReplayDetectedEvent, 'occurredAt'>) {
    super(data);
  }
}

export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGOUT: 'auth.logout',
  TOKEN_REFRESHED: 'auth.token.refreshed',
  TOKEN_REPLAY: 'auth.token.replay',
} as const;
