import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuditLogEntity } from './audit-log.entity';

export interface CreateAuditLogDto {
  tenantId: string;
  userId: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditRepository extends Repository<AuditLogEntity> {
  constructor(private dataSource: DataSource) {
    super(AuditLogEntity, dataSource.createEntityManager());
  }

  createLog(dto: CreateAuditLogDto): Promise<AuditLogEntity> {
    const entry = this.create({
      tenantId: dto.tenantId,
      userId: dto.userId ?? null,
      action: dto.action,
      resourceType: dto.resourceType ?? null,
      resourceId: dto.resourceId ?? null,
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
      metadata: dto.metadata ?? {},
    });
    return this.save(entry);
  }

  findByTenant(
    tenantId: string,
    filters: {
      userId?: string;
      action?: string;
      from?: Date;
      to?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100); // cap at 100

    const qb = this.createQueryBuilder('log')
      .where('log.tenant_id = :tenantId', { tenantId })
      .orderBy('log.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.userId) {
      qb.andWhere('log.user_id = :userId', { userId: filters.userId });
    }
    if (filters.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }
    if (filters.from) {
      qb.andWhere('log.created_at >= :from', { from: filters.from });
    }
    if (filters.to) {
      qb.andWhere('log.created_at <= :to', { to: filters.to });
    }

    return qb.getManyAndCount(); // returns [entries, totalCount] for pagination
  }
}
