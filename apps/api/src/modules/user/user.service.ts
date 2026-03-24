import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserRepository } from './user.repository';
import { TenantContext } from '../tenant/tenant-context.service';
import { RbacSeed } from '../rbac/rbac.seed';
import { RbacService } from '../rbac/rbac.service';
import { RegisterUserDto, UserResponse } from './user.schemas';
import { ConfigService } from '@nestjs/config';

interface Argon2Config {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
}

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private tenantContext: TenantContext,
    private rbacSeed: RbacSeed,
    private rbacService: RbacService,
    private configService: ConfigService,
  ) {}

  // resolves tenantId or throws — used by every method below
  private requireTenantId(): string {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new InternalServerErrorException('Tenant context is not set');
    }
    return tenantId;
  }

  async register(dto: RegisterUserDto): Promise<UserResponse> {
    const tenantId = this.requireTenantId();

    const exists = await this.userRepository.existsByEmail(dto.email, tenantId);
    if (exists) throw new ConflictException('Email already registered');

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

    const user = await this.userRepository.createUser({
      email: dto.email,
      passwordHash,
      tenantId,
    });

    const viewerRole = await this.rbacService.findRoleByName(
      'viewer',
      tenantId,
    );
    if (viewerRole) {
      await this.rbacService.assignRoleToUser(user.id, viewerRole.id, tenantId);
    }

    return this.toUserResponse(user);
  }

  async validatePassword(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    const tenantId = this.requireTenantId();

    const user = await this.userRepository.findByEmailWithPassword(
      email,
      tenantId,
    );
    if (!user) return null;

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) return null;

    return this.toUserResponse(user);
  }

  // single place that strips passwordHash and enforces the return shape
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
