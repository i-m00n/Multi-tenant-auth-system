import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { PERMISSIONS } from './permissions.constants';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';

@Injectable()
export class RbacSeed {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async seedPermissions(): Promise<void> {
    const permissionRepo = this.dataSource.getRepository(PermissionEntity);

    for (const name of Object.values(PERMISSIONS)) {
      const [resource, action] = name.split(':');
      const exists = await permissionRepo.existsBy({ name });
      if (!exists) {
        await permissionRepo.save(
          permissionRepo.create({ name, resource, action }),
        );
      }
    }
  }

  async seedRolesForTenant(
    tenantId: string,
    existingManager?: EntityManager,
  ): Promise<void> {
    const run = async (manager: EntityManager) => {
      const roleRepo = manager.getRepository(RoleEntity);
      const permRepo = manager.getRepository(PermissionEntity);

      const allPermissions = await permRepo.find();
      const readPermissions = allPermissions.filter((p) => p.action === 'read');

      const adminRole = await roleRepo.save(
        roleRepo.create({ name: 'admin', tenantId, isSystem: true }),
      );

      for (const perm of allPermissions) {
        await manager.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [adminRole.id, perm.id],
        );
      }

      // viewer role — gets read-only permissions
      const viewerRole = await roleRepo.save(
        roleRepo.create({ name: 'viewer', tenantId, isSystem: true }),
      );

      for (const perm of readPermissions) {
        await manager.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [viewerRole.id, perm.id],
        );
      }
    };

    if (existingManager) {
      await run(existingManager);
    } else {
      await this.dataSource.transaction(run);
    }
  }
}
