import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable()
export class TenantRepository extends Repository<Tenant> {
  constructor(private dataSource: DataSource) {
    super(Tenant, dataSource.createEntityManager());
  }

  findBySlug(slug: string) {
    return this.findOne({ where: { slug, isActive: true } });
  }
}
