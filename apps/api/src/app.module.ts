import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    TenantModule,
    UserModule,
    RbacModule,
    AuthModule,
  ],
  providers: [
    RlsSubscriber,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // runs first — populates req.user
    },
    {
      provide: APP_GUARD,
      useClass: RbacGuard, // runs second — needs req.user already set
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
