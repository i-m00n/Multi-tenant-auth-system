import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
} from '@nestjs/common';
import { TenantService } from '../tenant/tenant.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  CreateTenantSchema,
  type CreateTenantDto,
} from '../tenant/tenant.schemas';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../rbac/permissions.constants';

@Controller('platform/api/tenants')
export class PlatformTenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.TENANT_CREATE)
  @HttpCode(201)
  create(
    @Body(new ZodValidationPipe(CreateTenantSchema))
    dto: CreateTenantDto,
  ) {
    return this.tenantService.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.TENANT_READ)
  findAll() {
    return this.tenantService.findAll();
  }

  @Patch(':id/deactivate')
  @RequirePermissions(PERMISSIONS.TENANT_UPDATE)
  @HttpCode(204)
  deactivate(@Param('id') id: string) {
    return this.tenantService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @RequirePermissions(PERMISSIONS.TENANT_UPDATE)
  @HttpCode(204)
  reactivate(@Param('id') id: string) {
    return this.tenantService.reactivate(id);
  }
}
