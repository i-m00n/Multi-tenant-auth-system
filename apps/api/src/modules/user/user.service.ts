import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { TenantContext } from '../tenant/tenant-context.service';
import { RbacSeed } from '../rbac/rbac.seed';
import { RbacService } from '../rbac/rbac.service';
import { RegisterUserDto, UserResponse } from './user.schemas';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './user.entity';
import { RoleEntity } from '../rbac/role.entity';
import { UserRoleEntity } from '../rbac/user-role.entity';

interface Argon2Config {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
}

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    private userRepository: UserRepository,
    private tenantContext: TenantContext,
    private rbacSeed: RbacSeed,
    private rbacService: RbacService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterUserDto): Promise<UserResponse> {
    const tenantId = this.tenantContext.requireTenantId();

    const argon2Config = this.configService.get<Argon2Config>('argon2');
    if (!argon2Config) {
      throw new InternalServerErrorException('Argon2 config is missing');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: argon2Config.memoryCost,
      timeCost: argon2Config.timeCost,
      parallelism: argon2Config.parallelism,
    });

    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const roleRepo = manager.getRepository(RoleEntity);
      const userRoleRepo = manager.getRepository(UserRoleEntity);

      const exists = await userRepo.existsBy({ email: dto.email, tenantId });
      if (exists) throw new ConflictException('Email already registered');

      const user = await userRepo.save(
        userRepo.create({ email: dto.email, passwordHash, tenantId }),
      );

      const viewerRole = await roleRepo.findOne({
        where: { name: 'viewer', tenantId },
      });

      if (viewerRole) {
        await userRoleRepo.save(
          userRoleRepo.create({
            userId: user.id,
            roleId: viewerRole.id,
            tenantId,
          }),
        );
      }

      return this.toUserResponse(user);
    });
  }

  async validatePassword(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    const tenantId = this.tenantContext.requireTenantId();

    const user = await this.userRepository.findByEmailWithPassword(
      email,
      tenantId,
    );
    if (!user) return null;

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) return null;

    return this.toUserResponse(user);
  }

  private toUserResponse(user: {
    id: string;
    email: string;
    tenantId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
