import {
  EntitySubscriberInterface,
  BeforeQueryEvent,
  DataSource,
  AfterQueryEvent,
} from 'typeorm';
import { TenantContext } from '../modules/tenant/tenant-context.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RlsSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContext,
  ) {
    this.dataSource.subscribers.push(this);
  }

  async beforeQuery(event: BeforeQueryEvent<any>): Promise<void> {
    if (this.isSetQuery(event.query) || !event.queryRunner) return;
    const tenantId = this.tenantContext?.getTenantId() ?? '';
    await event.queryRunner.query(`SET app.current_tenant_id = '${tenantId}'`);
  }

  async afterQuery(event: AfterQueryEvent<any>): Promise<void> {
    if (this.isSetQuery(event.query) || !event.queryRunner) return;
    await event.queryRunner.query(`SET app.current_tenant_id = ''`);
  }

  private isSetQuery(query: unknown): boolean {
    if (typeof query !== 'string') return false;
    const normalized = query.trimStart().toUpperCase();
    return (
      normalized.startsWith('SET') ||
      normalized.startsWith('SELECT CURRENT_SETTING') ||
      ['START TRANSACTION', 'BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT'].some(
        (cmd) => normalized.startsWith(cmd),
      )
    );
  }
}
