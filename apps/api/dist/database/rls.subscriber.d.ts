import { EntitySubscriberInterface, BeforeQueryEvent, DataSource } from 'typeorm';
import { TenantContext } from '../modules/tenant/tenant-context.service';
export declare class RlsSubscriber implements EntitySubscriberInterface {
    private dataSource;
    private tenantContext;
    constructor(dataSource: DataSource, tenantContext: TenantContext);
    beforeQuery(event: BeforeQueryEvent<any>): Promise<void>;
}
