import { Module } from '@nestjs/common';
import { PlatformTenantController } from './platform-tenant.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [PlatformTenantController],
})
export class PlatformModule {}
