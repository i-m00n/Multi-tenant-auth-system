import { Controller, Get, Query } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { TenantContext } from '../tenant/tenant-context.service';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../rbac/permissions.constants';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import * as userSchemas from './audit.schemas';

@Controller(':tenant/api/audit')
export class AuditController {
  constructor(
    private auditRepository: AuditRepository,
    private tenantContext: TenantContext,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_READ)
  async getLogs(
    @Query(new ZodValidationPipe(userSchemas.AuditQuerySchema))
    query: userSchemas.AuditQueryDto,
  ) {
    const tenantId = this.tenantContext.requireTenantId();
    const [entries, total] = await this.auditRepository.findByTenant(
      tenantId,
      query,
    );

    return {
      data: entries,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
