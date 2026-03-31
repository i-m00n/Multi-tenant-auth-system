import { Request } from 'express';
import { Tenant } from '../modules/tenant/tenant.entity';
import { UserEntity } from '@modules/user/user.entity';

export interface TenantRequest extends Request {
  tenant: Tenant;
  user: UserEntity;
}
