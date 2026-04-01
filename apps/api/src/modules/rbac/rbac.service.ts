import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { RbacRepository } from './rbac.repository';
import { PermissionRepository } from './permission.repository';
import { TenantContext } from '../tenant/tenant-context.service';
import { Permission } from './permissions.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  RBAC_EVENTS,
  RoleAssignedEvent,
  RoleCreatedEvent,
} from 'src/common/events/rbac.events';

@Injectable()
export class RbacService {
  constructor(
    private rbacRepository: RbacRepository,
    private permissionRepository: PermissionRepository,
    private tenantContext: TenantContext,
    private eventEmitter: EventEmitter2,
  ) {}

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.rbacRepository.findRolesByUserId(userId);
    const permissions = userRoles
      .flatMap((ur) => ur.role.permissions)
      .map((p) => p.name);
    return [...new Set(permissions)];
  }

  async assignRoleToUser(userId: string, roleId: string, tenantId: string) {
    return this.rbacRepository.assignRole(userId, roleId, tenantId);
  }

  findRoleByName(name: string, tenantId: string) {
    return this.rbacRepository.findRoleByName(name, tenantId);
  }

  getRolesForTenant(tenantId: string) {
    return this.rbacRepository.findRolesByTenantId(tenantId);
  }

  async createRole(
    name: string,
    tenantId: string,
    currentUserId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const existing = await this.rbacRepository.findRoleByName(name, tenantId);
    if (existing) throw new ConflictException(`Role '${name}' already exists`);
    const role = await this.rbacRepository.createRole({
      name,
      tenantId,
      isSystem: false,
    });
    this.eventEmitter.emit(
      RBAC_EVENTS.ROLE_CREATED,
      new RoleCreatedEvent({
        tenantId,
        createdByUserId: currentUserId,
        roleId: role.id,
        roleName: role.name,
        ipAddress,
        userAgent,
      }),
    );
    return;
  }

  async assignPermissionToRole(
    roleId: string,
    permissionName: Permission,
    tenantId: string,
  ) {
    const role = await this.rbacRepository.findRoleById(roleId);
    if (!role) throw new NotFoundException('Role not found');
    if (role.tenantId !== tenantId)
      throw new ForbiddenException('Role does not belong to this tenant');
    if (role.isSystem)
      throw new ForbiddenException('Cannot modify system roles');

    const permission =
      await this.permissionRepository.findByName(permissionName);

    if (!permission)
      throw new NotFoundException(`Permission '${permissionName}' not found`);

    return this.rbacRepository.assignPermissionToRole(roleId, permission.id);
  }

  async assignRoleToUserSafe(
    userId: string,
    roleId: string,
    tenantId: string,
    currentUserId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const role = await this.rbacRepository.findRoleById(roleId);
    if (!role) throw new NotFoundException('Role not found');
    if (role.tenantId !== tenantId)
      throw new ForbiddenException('Role does not belong to this tenant');

    const existing = await this.rbacRepository.findUserRole(userId, roleId);
    if (existing) throw new ConflictException('User already has this role');
    await this.rbacRepository.assignRole(userId, roleId, tenantId);

    this.eventEmitter.emit(
      RBAC_EVENTS.ROLE_ASSIGNED,
      new RoleAssignedEvent({
        tenantId,
        assignedByUserId: currentUserId,
        assignedToUserId: userId,
        roleId,
        roleName: role.name,
        ipAddress,
        userAgent,
      }),
    );
    return;
  }
}
