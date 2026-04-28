import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/typeorm.config';
import { TenantModule } from './modules/tenant/tenant.module';
import { RlsSubscriber } from './database/rls.subscriber';
import { UserModule } from './modules/user/user.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { RbacGuard } from './common/guards/rbac.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from '@modules/auth/auth.module';
import { AppService } from './app.service';
import { RateLimitModule } from '@modules/rate-limit/rate-limit.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditModule } from './modules/audit/audit.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PlatformModule } from '@modules/platform/platform.module';
import { DemoModule } from '@modules/demo/demo.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env.THROTTLER_TTL_MS ?? '60000'),
          limit: parseInt(process.env.THROTTLER_LIMIT ?? '100'),
        },
      ],
    }),
    RateLimitModule,
    TenantModule,
    UserModule,
    RbacModule,
    AuthModule,
    AuditModule,
    PlatformModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      global: true,
    }),
    ...(process.env.NODE_ENV !== 'production' ? [DemoModule] : []),
  ],
  providers: [
    RlsSubscriber,
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // runs first - populates req.user
    },
    {
      provide: APP_GUARD,
      useClass: RbacGuard, // runs second - needs req.user already set
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude({ path: 'demo/seed', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
