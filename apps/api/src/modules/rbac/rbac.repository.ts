import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserRoleEntity } from './user-role.entity';
import { RoleEntity } from './role.entity';

@Injectable()
export class RbacRepository {
  private userRoleRepo: Repository<UserRoleEntity>;
  private roleRepo: Repository<RoleEntity>;

  constructor(private dataSource: DataSource) {
    this.userRoleRepo = dataSource.getRepository(UserRoleEntity);
    this.roleRepo = dataSource.getRepository(RoleEntity);
  }

  findRolesByUserId(userId: string) {
    return this.userRoleRepo.find({
      where: { userId },
      relations: ['role', 'role.permissions'],
    });
  }

  findRoleByName(name: string, tenantId: string) {
    return this.roleRepo.findOne({ where: { name, tenantId } });
  }

  createRole(data: { name: string; tenantId: string; isSystem: boolean }) {
    const role = this.roleRepo.create(data);
    return this.roleRepo.save(role);
  }

  assignRole(userId: string, roleId: string, tenantId: string) {
    const userRole = this.userRoleRepo.create({ userId, roleId, tenantId });
    return this.userRoleRepo.save(userRole);
  }

  findRolesByTenantId(tenantId: string) {
    return this.roleRepo.find({
      where: { tenantId },
      relations: ['permissions'],
    });
  }

  findRoleById(id: string) {
    return this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  findUserRole(userId: string, roleId: string) {
    return this.userRoleRepo.findOne({ where: { userId, roleId } });
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    await this.dataSource.query(
      `INSERT INTO role_permissions (role_id, permission_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [roleId, permissionId],
    );
  }
}
