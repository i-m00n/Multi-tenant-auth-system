import {
  EntitySubscriberInterface,
  BeforeQueryEvent,
  DataSource,
  AfterQueryEvent,
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
    if (this.isSetQuery(event.query) || !event.queryRunner) return;

    const tenantId = this.tenantContext?.getTenantId() ?? '';

    await event.queryRunner.query(`SET app.current_tenant_id = '${tenantId}'`);
  }

  async afterQuery(event: AfterQueryEvent<any>) {
    if (this.isSetQuery(event.query) || !event.queryRunner) return;

    await event.queryRunner.query(`SET app.current_tenant_id = ''`);
  }

  private isSetQuery(query: unknown): boolean {
    return (
      typeof query === 'string' &&
      query.trimStart().toUpperCase().startsWith('SET')
    );
  }
}
