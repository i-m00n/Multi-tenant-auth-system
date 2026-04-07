import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TenantContext } from './tenant-context.service';
import { TenantRepository } from './tenant.repository';
import { Tenant } from './tenant.entity';
import { CreateTenantDto } from './tenant.schemas';
import { RbacSeed } from '@modules/rbac/rbac.seed';

@Injectable()
export class TenantService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContext,
    private readonly tenantRepository: TenantRepository,
    private readonly rbacSeed: RbacSeed,
  ) {}

  getTenantId(): string {
    return this.tenantContext.requireTenantId();
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findBySlug(slug);
    if (!tenant) throw new NotFoundException(`Tenant '${slug}' not found`);
    return tenant;
  }

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const exists = await this.tenantRepository.existsBySlug(dto.slug);
    if (exists)
      throw new ConflictException(`Slug '${dto.slug}' is already taken`);

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const tenant = manager.create(Tenant, {
        name: dto.name,
        slug: dto.slug,
      });
      const saved = await manager.save(Tenant, tenant);
      await this.tenantContext.run(saved.id, () =>
        this.rbacSeed.seedRolesForTenant(saved.id, manager),
      );
      return saved;
    });
  }
}
