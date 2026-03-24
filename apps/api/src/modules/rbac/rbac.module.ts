import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RbacRepository } from './rbac.repository';
import { RbacSeed } from './rbac.seed';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';
import { UserRoleEntity } from './user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity, UserRoleEntity]),
  ],
  providers: [RbacService, RbacRepository, RbacSeed],
  exports: [RbacService, RbacSeed],
})
export class RbacModule {}
