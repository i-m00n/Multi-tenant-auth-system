import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { RbacSeed } from './modules/rbac/rbac.seed';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private rbacSeed: RbacSeed) {}

  async onApplicationBootstrap() {
    await this.rbacSeed.seedPermissions();
  }
}
