import { Request } from 'express';
import { Tenant } from '../modules/tenant/tenant.entity';

export interface TenantRequest extends Request {
  tenant: Tenant;
}
