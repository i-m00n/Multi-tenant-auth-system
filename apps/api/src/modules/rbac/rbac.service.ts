import { Injectable } from '@nestjs/common';
import { RbacRepository } from './rbac.repository';
import { Permission } from './permissions.constants';

@Injectable()
export class RbacService {
  constructor(private rbacRepository: RbacRepository) {}

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.rbacRepository.findRolesByUserId(userId);
    const permissions = userRoles
      .flatMap((ur) => ur.role.permissions)
      .map((p) => p.name);
    return [...new Set(permissions)];
  }

  assignRoleToUser(userId: string, roleId: string, tenantId: string) {
    return this.rbacRepository.assignRole(userId, roleId, tenantId);
  }

  findRoleByName(name: string, tenantId: string) {
    return this.rbacRepository.findRoleByName(name, tenantId);
  }
}
