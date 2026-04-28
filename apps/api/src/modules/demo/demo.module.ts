import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { TenantModule } from '../tenant/tenant.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TenantModule, UserModule, AuthModule],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
