import { Injectable } from '@nestjs/common';
import { TenantContext } from './tenant-context.service';

@Injectable()
export class TenantService {
  constructor(private tenantContext: TenantContext) {}

  getTenantId() {
    return this.tenantContext.getTenantId();
  }
}
