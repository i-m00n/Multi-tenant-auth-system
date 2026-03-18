import { DataSource, Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
export declare class TenantRepository extends Repository<Tenant> {
    private dataSource;
    constructor(dataSource: DataSource);
    findBySlug(slug: string): Promise<Tenant | null>;
}
