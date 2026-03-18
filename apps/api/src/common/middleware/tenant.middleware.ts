import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { TenantRepository } from '../../modules/tenant/tenant.repository';
import { Request, Response, NextFunction } from 'express';
import { TenantRequest } from 'src/types/tenant-request.interface';
import { TenantContext } from '@modules/tenant/tenant-context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private tenantRepo: TenantRepository,
    private tenantContext: TenantContext,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    const parts = req.originalUrl.split('/');
    const slug = parts[1];

    if (!slug) throw new NotFoundException('Tenant not provided');

    const tenant = await this.tenantRepo.findBySlug(slug);
    if (!tenant) throw new NotFoundException('Tenant not found');

    this.tenantContext.run(tenant.id, () => {
      req.tenant = tenant;
      next();
    });
  }
}
