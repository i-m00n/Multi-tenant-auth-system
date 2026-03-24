import {
  EntitySubscriberInterface,
  BeforeQueryEvent,
  DataSource,
} from 'typeorm';
import { TenantContext } from '../modules/tenant/tenant-context.service';
import { InjectDataSource } from '@nestjs/typeorm';

export class RlsSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private tenantContext: TenantContext,
  ) {
    this.dataSource.subscribers.push(this);
  }

  async beforeQuery(event: BeforeQueryEvent<any>) {
    const tenantId = this.tenantContext?.getTenantId();
    if (!tenantId || !event.queryRunner) return;

    // Guard: skip if this query IS the SET LOCAL itself
    if (
      typeof event.query === 'string' &&
      event.query.trimStart().toUpperCase().startsWith('SET')
    ) {
      return;
    }

    await event.queryRunner.query(
      `SET LOCAL app.current_tenant_id = '${tenantId}'`,
    );
  }
}
