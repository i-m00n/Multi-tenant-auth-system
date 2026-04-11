import { Entity, Column, Unique, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { UserRoleEntity } from '../rbac/user-role.entity';

@Entity('users')
@Unique(['email', 'tenantId'])
export class UserEntity extends BaseEntity {
  @Column()
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles: UserRoleEntity[];
}
