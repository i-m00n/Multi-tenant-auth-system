import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './tenant.entity';
import { TenantRepository } from './tenant.repository';
import { TenantContext } from './tenant-context.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [TenantService, TenantRepository, TenantContext],
  exports: [TenantService, TenantRepository, TenantContext],
  controllers: [TenantController],
})
export class TenantModule {}
