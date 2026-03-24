import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';

@Entity('users')
@Unique(['email', 'tenantId']) // ← the critical constraint: unique per tenant, not globally
export class UserEntity extends BaseEntity {
  @Column()
  email: string;

  @Column({ name: 'password_hash', select: false }) // select: false = NEVER returned by default
  passwordHash: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
