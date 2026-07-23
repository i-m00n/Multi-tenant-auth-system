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
    // is_local=true behaves like SET LOCAL (auto-resets at commit/rollback);
    // is_local=false behaves like session-level SET and needs the manual
    // reset in afterQuery below. set_config is parameterized — no string
    // interpolation into the SQL.
    const isLocal = event.queryRunner.isTransactionActive;
    await event.queryRunner.query(
      `SELECT set_config('app.current_tenant_id', $1, $2)`,
      [tenantId, isLocal],
    );
  }

  async afterQuery(event: AfterQueryEvent<any>): Promise<void> {
    if (this.isSetQuery(event.query) || !event.queryRunner) return;
    // inside a transaction, the SET LOCAL above already resets itself at
    // commit/rollback — nothing to clean up here.
    if (event.queryRunner.isTransactionActive) return;
    await event.queryRunner.query(
      `SELECT set_config('app.current_tenant_id', $1, false)`,
      [''],
    );
  }

  private isSetQuery(query: unknown): boolean {
    if (typeof query !== 'string') return false;
    const normalized = query.trimStart().toUpperCase();
    return (
      normalized.startsWith('SET') ||
      normalized.startsWith('SELECT CURRENT_SETTING') ||
      normalized.startsWith('SELECT SET_CONFIG') ||
      ['START TRANSACTION', 'BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT'].some(
        (cmd) => normalized.startsWith(cmd),
      )
    );
  }
}
