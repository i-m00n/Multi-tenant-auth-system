import { TenantContext } from './tenant-context.service';
export declare class TenantService {
    private tenantContext;
    constructor(tenantContext: TenantContext);
    getTenantId(): string | undefined;
}
