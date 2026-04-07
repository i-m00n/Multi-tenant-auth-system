import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import type { TenantRequest } from 'src/types/tenant-request.interface';
import { TenantService } from './tenant.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import * as tenantSchemas from './tenant.schemas';
import { Public } from 'src/common/decorators/public.decorator';

@Controller()
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get(':tenant/api/test')
  testTenant(@Req() req: TenantRequest) {
    return { tenant: req.tenant };
  }

  @Get(':tenant/api/test/id')
  getTenantId() {
    return { tenantId: this.tenantService.getTenantId() };
  }

  @Post('tenants')
  @Public()
  create(
    @Body(new ZodValidationPipe(tenantSchemas.CreateTenantSchema))
    dto: tenantSchemas.CreateTenantDto,
  ) {
    return this.tenantService.create(dto);
  }

  @Get('tenants/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }
}
