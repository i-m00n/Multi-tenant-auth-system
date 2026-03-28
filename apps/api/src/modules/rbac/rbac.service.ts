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

@Injectable()
export class RbacService {
  constructor(
    private rbacRepository: RbacRepository,
    private permissionRepository: PermissionRepository,
    private tenantContext: TenantContext,
  ) {}

  // existing
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.rbacRepository.findRolesByUserId(userId);
    const permissions = userRoles
      .flatMap((ur) => ur.role.permissions)
      .map((p) => p.name);
    return [...new Set(permissions)];
  }

  // existing
  async assignRoleToUser(userId: string, roleId: string, tenantId: string) {
    return this.rbacRepository.assignRole(userId, roleId, tenantId);
  }

  // existing
  findRoleByName(name: string, tenantId: string) {
    return this.rbacRepository.findRoleByName(name, tenantId);
  }

  // new - list all roles for current tenant
  getRolesForTenant(tenantId: string) {
    return this.rbacRepository.findRolesByTenantId(tenantId);
  }

  // new - create a custom role (non-system)
  async createRole(name: string, tenantId: string) {
    const existing = await this.rbacRepository.findRoleByName(name, tenantId);
    if (existing) throw new ConflictException(`Role '${name}' already exists`);

    return this.rbacRepository.createRole({ name, tenantId, isSystem: false });
  }

  // new - assign a permission to a role
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

  // new - assign a role to a user (with tenant validation)
  async assignRoleToUserSafe(userId: string, roleId: string, tenantId: string) {
    const role = await this.rbacRepository.findRoleById(roleId);
    if (!role) throw new NotFoundException('Role not found');
    if (role.tenantId !== tenantId)
      throw new ForbiddenException('Role does not belong to this tenant');

    const existing = await this.rbacRepository.findUserRole(userId, roleId);
    if (existing) throw new ConflictException('User already has this role');

    return this.rbacRepository.assignRole(userId, roleId, tenantId);
  }
}
