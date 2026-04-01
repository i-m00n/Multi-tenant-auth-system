export class BaseEvent {
  tenantId: string;
  ipAddress: string;
  userAgent: string;
  occurredAt: Date = new Date();

  constructor(data: Omit<BaseEvent, 'occurredAt'>) {
    Object.assign(this, data);
  }
}
