import { BaseEntity } from '../../database/base.entity';
export declare class Tenant extends BaseEntity {
    name: string;
    slug: string;
    isActive: boolean;
}
