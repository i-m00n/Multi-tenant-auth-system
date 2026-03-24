import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { PermissionEntity } from './permission.entity';

@Entity('roles')
export class RoleEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean; // true = seeded role (admin/viewer), false = custom

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles, {
    eager: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: PermissionEntity[];
}
