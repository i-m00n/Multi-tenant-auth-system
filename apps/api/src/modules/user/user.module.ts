import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';
import { RbacModule } from '../rbac/rbac.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), RbacModule, TenantModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
