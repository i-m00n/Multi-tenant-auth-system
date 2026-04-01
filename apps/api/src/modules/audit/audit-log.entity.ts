import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // nullable — anonymous events like failed logins have no userId
  @Index()
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Index()
  @Column({ name: 'user_id', nullable: true, type: 'uuid' })
  userId: string | null;

  @Index()
  @Column({ length: 100 })
  action: string; // 'auth.login.success', 'rbac.role.assigned', etc.

  @Column({
    name: 'resource_type',
    length: 50,
    nullable: true,
    type: 'varchar',
  })
  resourceType: string | null; // 'user', 'role', 'session', 'tenant'

  @Column({ name: 'resource_id', nullable: true, type: 'uuid' })
  resourceId: string | null;

  @Column({ name: 'ip_address', length: 45, nullable: true, type: 'varchar' })
  ipAddress: string | null; // 45 chars supports IPv6

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, unknown>;

  // no updatedAt — this entity is append-only by design
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
