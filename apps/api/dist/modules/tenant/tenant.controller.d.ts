import type { TenantRequest } from 'src/types/tenant-request.interface';
import { TenantService } from './tenant.service';
export declare class TenantController {
    private tenantService;
    constructor(tenantService: TenantService);
    testTenant(req: TenantRequest): {
        tenant: import("./tenant.entity").Tenant;
    };
    getTenantId(): {
        tenantId: string | undefined;
    };
}
