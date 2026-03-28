import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface TenantStore {
  tenantId: string;
}

@Injectable()
export class TenantContext {
  private als = new AsyncLocalStorage<TenantStore>();

  run(tenantId: string, callback: () => void) {
    this.als.run({ tenantId }, callback);
  }

  getTenantId(): string | undefined {
    const store = this.als.getStore();
    if (!store) {
      return undefined;
    }
    return store.tenantId;
  }

  requireTenantId(): string {
    const tenantId = this.getTenantId();
    if (!tenantId) {
      throw new InternalServerErrorException('Tenant context is not set');
    }
    return tenantId;
  }
}
