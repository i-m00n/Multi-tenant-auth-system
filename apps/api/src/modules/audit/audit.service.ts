import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditRepository } from './audit.repository';
import {
  AUTH_EVENTS,
  LoginSuccessEvent,
  LoginFailedEvent,
  LogoutEvent,
  TokenRefreshedEvent,
  TokenReplayDetectedEvent,
} from '../../common/events/auth.events';
import {
  USER_EVENTS,
  UserRegisteredEvent,
} from '../../common/events/user.events';
import {
  RBAC_EVENTS,
  RoleAssignedEvent,
  RoleCreatedEvent,
  RoleRemovedEvent,
  PermissionRemovedEvent,
} from '../../common/events/rbac.events';
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private auditRepository: AuditRepository) {}

  // auth events

  @OnEvent(AUTH_EVENTS.LOGIN_SUCCESS)
  async onLoginSuccess(event: LoginSuccessEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: event.userId,
      action: AUTH_EVENTS.LOGIN_SUCCESS,
      resourceType: 'session',
      resourceId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    });
  }

  @OnEvent(AUTH_EVENTS.LOGIN_FAILED)
  async onLoginFailed(event: LoginFailedEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: null,
      action: AUTH_EVENTS.LOGIN_FAILED,
      resourceType: 'user',
      resourceId: null,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: { email: event.email, reason: event.reason },
    });
  }

  @OnEvent(AUTH_EVENTS.LOGOUT)
  async onLogout(event: LogoutEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: event.userId,
      action: AUTH_EVENTS.LOGOUT,
      resourceType: 'session',
      resourceId: event.familyId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: { logoutAll: event.logoutAll },
    });
  }

  @OnEvent(AUTH_EVENTS.TOKEN_REFRESHED)
  async onTokenRefreshed(event: TokenRefreshedEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: event.userId,
      action: AUTH_EVENTS.TOKEN_REFRESHED,
      resourceType: 'session',
      resourceId: event.familyId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    });
  }

  @OnEvent(AUTH_EVENTS.TOKEN_REPLAY)
  async onTokenReplay(event: TokenReplayDetectedEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: null, // unknown — stolen token, identity unverified
      action: AUTH_EVENTS.TOKEN_REPLAY,
      resourceType: 'session',
      resourceId: event.familyId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: { severity: 'high' },
    });
  }

  // user events

  @OnEvent(USER_EVENTS.REGISTERED)
  async onUserRegistered(event: UserRegisteredEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: event.userId,
      action: USER_EVENTS.REGISTERED,
      resourceType: 'user',
      resourceId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: { email: event.email },
    });
  }

  // rbac events

  @OnEvent(RBAC_EVENTS.ROLE_ASSIGNED)
  async onRoleAssigned(event: RoleAssignedEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: event.assignedByUserId,
      action: RBAC_EVENTS.ROLE_ASSIGNED,
      resourceType: 'role',
      resourceId: event.roleId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: {
        roleName: event.roleName,
        assignedToUserId: event.assignedToUserId,
      },
    });
  }

  @OnEvent(RBAC_EVENTS.ROLE_CREATED)
  async onRoleCreated(event: RoleCreatedEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: event.createdByUserId,
      action: RBAC_EVENTS.ROLE_CREATED,
      resourceType: 'role',
      resourceId: event.roleId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: { roleName: event.roleName },
    });
  }

  @OnEvent(RBAC_EVENTS.ROLE_REMOVED)
  async onRoleRemoved(event: RoleRemovedEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: event.removedByUserId,
      action: RBAC_EVENTS.ROLE_REMOVED,
      resourceType: 'role',
      resourceId: event.roleId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: {
        roleName: event.roleName,
        removedFromUserId: event.removedFromUserId,
      },
    });
  }

  @OnEvent(RBAC_EVENTS.PERMISSION_REMOVED)
  async onPermissionRemoved(event: PermissionRemovedEvent) {
    await this.write({
      tenantId: event.tenantId,
      userId: event.removedByUserId,
      action: RBAC_EVENTS.PERMISSION_REMOVED,
      resourceType: 'role',
      resourceId: event.roleId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: {
        roleName: event.roleName,
        permission: event.permission,
      },
    });
  }

  private async write(data: Parameters<AuditRepository['createLog']>[0]) {
    try {
      await this.auditRepository.createLog(data);
    } catch (error) {
      this.logger.error(
        `Failed to write audit log for action "${data.action}": ${String(error)}`,
      );
    }
  }
}
