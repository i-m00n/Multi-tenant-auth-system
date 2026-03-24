import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import * as permissionsConstants from './permissions.constants';
import { RoleEntity } from './role.entity';

@Entity('permissions')
export class PermissionEntity extends BaseEntity {
  @Column({ unique: true })
  name: permissionsConstants.Permission;

  @Column()
  resource: string; // 'user', 'role', 'tenant'

  @Column()
  action: string; // 'read', 'create', 'delete'

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
