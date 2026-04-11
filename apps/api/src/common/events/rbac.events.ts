import { BaseEvent } from './base.event';

export class RoleAssignedEvent extends BaseEvent {
  assignedByUserId: string;
  assignedToUserId: string;
  roleId: string;
  roleName: string;

  constructor(data: Omit<RoleAssignedEvent, 'occurredAt'>) {
    super(data);
  }
}

export class RoleCreatedEvent extends BaseEvent {
  createdByUserId: string;
  roleId: string;
  roleName: string;

  constructor(data: Omit<RoleCreatedEvent, 'occurredAt'>) {
    super(data);
  }
}

export class RoleRemovedEvent extends BaseEvent {
  removedByUserId: string;
  removedFromUserId: string;
  roleId: string;
  roleName: string;

  constructor(data: Omit<RoleRemovedEvent, 'occurredAt'>) {
    super(data);
  }
}

export class PermissionRemovedEvent extends BaseEvent {
  removedByUserId: string;
  roleId: string;
  roleName: string;
  permission: string;

  constructor(data: Omit<PermissionRemovedEvent, 'occurredAt'>) {
    super(data);
  }
}

export const RBAC_EVENTS = {
  ROLE_ASSIGNED: 'rbac.role.assigned',
  ROLE_CREATED: 'rbac.role.created',
  ROLE_REMOVED: 'rbac.role.removed',
  PERMISSION_REMOVED: 'rbac.permission.removed',
} as const;
