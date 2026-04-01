import { BaseEvent } from './base.event';

export class UserRegisteredEvent extends BaseEvent {
  userId: string;
  email: string;

  constructor(data: Omit<UserRegisteredEvent, 'occurredAt'>) {
    super(data);
  }
}

export const USER_EVENTS = {
  REGISTERED: 'user.registered',
} as const;
