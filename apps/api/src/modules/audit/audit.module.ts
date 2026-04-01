import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from './audit-log.entity';
import { AuditRepository } from './audit.repository';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity]), TenantModule],
  providers: [AuditRepository, AuditService],
  controllers: [AuditController],
})
export class AuditModule {}
