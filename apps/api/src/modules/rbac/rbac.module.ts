import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RbacRepository } from './rbac.repository';
import { RbacSeed } from './rbac.seed';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';
import { UserRoleEntity } from './user-role.entity';
import { PermissionRepository } from './permission.repository';
import { TenantModule } from '@modules/tenant/tenant.module';
import { RbacController, UserRoleController } from './rbac.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity, UserRoleEntity]),
    forwardRef(() => TenantModule),
  ],
  controllers: [RbacController, UserRoleController],
  providers: [RbacService, RbacRepository, RbacSeed, PermissionRepository],
  exports: [RbacService, RbacSeed, RbacRepository, PermissionRepository],
})
export class RbacModule {}
