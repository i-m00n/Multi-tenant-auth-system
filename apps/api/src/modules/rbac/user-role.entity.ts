import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { UserEntity } from '../user/user.entity';
import { RoleEntity } from './role.entity';

@Entity('user_roles')
export class UserRoleEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;
}
