import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CreateTenantDto } from './tenant.schemas';

@Injectable()
export class TenantRepository extends Repository<Tenant> {
  constructor(private dataSource: DataSource) {
    super(Tenant, dataSource.createEntityManager());
  }

  findBySlug(slug: string) {
    return this.findOne({ where: { slug, isActive: true } });
  }

  existsBySlug(slug: string) {
    return this.existsBy({ slug });
  }

  createTenant(dto: CreateTenantDto) {
    const tenant = this.create(dto);
    return this.save(tenant);
  }
}
