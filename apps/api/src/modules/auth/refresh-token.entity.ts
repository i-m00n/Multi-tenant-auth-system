import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { UserEntity } from '../user/user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity extends BaseEntity {
  // stored as SHA-256 hash, never the raw token
  @Column({ name: 'token_hash', unique: true })
  tokenHash: string;

  // groups all tokens belonging to one session
  // when one is replayed, the entire family is revoked
  @Index()
  @Column({ name: 'family_id' })
  familyId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
