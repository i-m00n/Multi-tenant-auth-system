import { NestMiddleware } from '@nestjs/common';
import { TenantRepository } from '../../modules/tenant/tenant.repository';
import { Response, NextFunction } from 'express';
import { TenantRequest } from 'src/types/tenant-request.interface';
import { TenantContext } from '@modules/tenant/tenant-context.service';
export declare class TenantMiddleware implements NestMiddleware {
    private tenantRepo;
    private tenantContext;
    constructor(tenantRepo: TenantRepository, tenantContext: TenantContext);
    use(req: TenantRequest, res: Response, next: NextFunction): Promise<void>;
}
