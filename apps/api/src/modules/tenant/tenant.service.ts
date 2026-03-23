import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TenantContext } from './tenant-context.service';
import { TenantRepository } from './tenant.repository';
import { CreateTenantDto } from './tenant.schemas';

@Injectable()
export class TenantService {
  constructor(
    private tenantContext: TenantContext,
    private tenantRepository: TenantRepository,
  ) {}

  getTenantId() {
    return this.tenantContext.getTenantId();
  }

  async findBySlug(slug: string) {
    const tenant = await this.tenantRepository.findBySlug(slug);
    if (!tenant) throw new NotFoundException(`Tenant '${slug}' not found`);
    return tenant;
  }

  async create(dto: CreateTenantDto) {
    const exists = await this.tenantRepository.existsBySlug(dto.slug);
    if (exists)
      throw new ConflictException(`Slug '${dto.slug}' is already taken`);
    return this.tenantRepository.createTenant(dto);
  }
}
