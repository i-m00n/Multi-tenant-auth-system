import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { TenantContext } from './tenant-context.service';
import { TenantRepository } from './tenant.repository';
import { Tenant } from './tenant.entity';
import { CreateTenantDto } from './tenant.schemas';
import { RbacSeed } from '@modules/rbac/rbac.seed';
import { UserEntity } from '@modules/user/user.entity';
import { RoleEntity } from '@modules/rbac/role.entity';
import { UserRoleEntity } from '@modules/rbac/user-role.entity';

interface Argon2Config {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
}

export interface CreateTenantResult {
  tenant: { id: string; name: string; slug: string };
  admin: { id: string; email: string };
}

@Injectable()
export class TenantService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContext,
    private readonly tenantRepository: TenantRepository,
    private readonly rbacSeed: RbacSeed,
    private readonly configService: ConfigService,
  ) {}

  getTenantId(): string {
    return this.tenantContext.requireTenantId();
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findBySlug(slug);
    if (!tenant) throw new NotFoundException(`Tenant '${slug}' not found`);
    return tenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }

  async deactivate(id: string): Promise<void> {
    return this.tenantRepository.deactivate(id);
  }

  async reactivate(id: string): Promise<void> {
    return this.tenantRepository.reactivate(id);
  }

  async create(dto: CreateTenantDto): Promise<CreateTenantResult> {
    const exists = await this.tenantRepository.existsBySlug(dto.slug);
    if (exists)
      throw new ConflictException(`Slug '${dto.slug}' is already taken`);

    const argon2Config = this.configService.get<Argon2Config>('argon2');
    if (!argon2Config)
      throw new InternalServerErrorException('Argon2 config missing');

    const passwordHash = await argon2.hash(dto.adminPassword, {
      type: argon2.argon2id,
      memoryCost: argon2Config.memoryCost,
      timeCost: argon2Config.timeCost,
      parallelism: argon2Config.parallelism,
    });

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const tenant = await manager.save(
        Tenant,
        manager.create(Tenant, { name: dto.name, slug: dto.slug }),
      );

      return this.tenantContext.run(tenant.id, async () => {
        await this.rbacSeed.seedRolesForTenant(tenant.id, manager);

        const userRepo = manager.getRepository(UserEntity);
        const adminUser = await userRepo.save(
          userRepo.create({
            email: dto.adminEmail,
            passwordHash,
            tenantId: tenant.id,
            isActive: true,
          }),
        );

        const roleRepo = manager.getRepository(RoleEntity);
        const adminRole = await roleRepo.findOne({
          where: { name: 'admin', tenantId: tenant.id },
        });

        if (!adminRole) {
          throw new InternalServerErrorException(
            'Admin role not found after seeding',
          );
        }

        const userRoleRepo = manager.getRepository(UserRoleEntity);
        await userRoleRepo.save(
          userRoleRepo.create({
            userId: adminUser.id,
            roleId: adminRole.id,
            tenantId: tenant.id,
          }),
        );

        return {
          tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
          admin: { id: adminUser.id, email: adminUser.email },
        };
      });
    });
  }
}
