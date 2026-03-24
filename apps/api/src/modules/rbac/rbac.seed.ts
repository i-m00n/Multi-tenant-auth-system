import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PERMISSIONS } from './permissions.constants';
import { RbacRepository } from './rbac.repository';
import { PermissionEntity } from './permission.entity';

@Injectable()
export class RbacSeed {
  private permissionRepo: Repository<PermissionEntity>; // ← typed explicitly

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private rbacRepository: RbacRepository,
  ) {
    this.permissionRepo = dataSource.getRepository(PermissionEntity);
  }

  async seedPermissions(): Promise<void> {
    for (const name of Object.values(PERMISSIONS)) {
      const [resource, action] = name.split(':');
      const exists = await this.permissionRepo.existsBy({ name });
      if (!exists) {
        await this.permissionRepo.save(
          this.permissionRepo.create({ name, resource, action }),
        );
      }
    }
  }

  async seedRolesForTenant(tenantId: string): Promise<void> {
    const allPermissions = await this.permissionRepo.find();

    // Create admin role and assign all permissions
    const adminRole = await this.rbacRepository.createRole({
      name: 'admin',
      tenantId,
      isSystem: true,
    });

    await this.dataSource.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions
       ON CONFLICT DO NOTHING`,
      [adminRole.id],
    );

    // Create viewer role and assign only read permissions
    const viewerRole = await this.rbacRepository.createRole({
      name: 'viewer',
      tenantId,
      isSystem: true,
    });

    const readPermissions = allPermissions.filter((p) => p.action === 'read');
    for (const perm of readPermissions) {
      await this.dataSource.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [viewerRole.id, perm.id],
      );
    }
  }
}
