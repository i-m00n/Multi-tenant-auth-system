import { Controller, Get, Req } from '@nestjs/common';
import type { TenantRequest } from 'src/types/tenant-request.interface';
import { TenantService } from './tenant.service';

@Controller(':tenant/api/test')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get()
  testTenant(@Req() req: TenantRequest) {
    // req.tenant comes from middleware
    return { tenant: req.tenant };
  }
  @Get('id')
  getTenantId() {
    return { tenantId: this.tenantService.getTenantId() };
  }
}
