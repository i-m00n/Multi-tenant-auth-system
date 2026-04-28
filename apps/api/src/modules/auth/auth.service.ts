import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from './token.service';
import { TenantContext } from '../tenant/tenant-context.service';
import { randomUUID } from 'crypto';
import type { LoginDto } from './auth.schemas';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AUTH_EVENTS,
  LoginFailedEvent,
  LoginSuccessEvent,
  LogoutEvent,
} from 'src/common/events/auth.events';
import { TenantRepository } from '@modules/tenant/tenant.repository';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private tenantContext: TenantContext,
    private eventEmitter: EventEmitter2,
    private tenantRepository: TenantRepository,
  ) {}

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const tenantId = this.tenantContext.requireTenantId();
    const user = await this.userService.validatePassword(
      dto.email,
      dto.password,
    );
    if (!user) {
      this.eventEmitter.emit(
        AUTH_EVENTS.LOGIN_FAILED,
        new LoginFailedEvent({
          tenantId,
          email: dto.email,
          reason: 'invalid_credentials',
          ipAddress,
          userAgent,
        }),
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const familyId = randomUUID();
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      tenantId,
      familyId,
    });

    const refreshToken = await this.tokenService.generateRefreshToken(
      user.id,
      tenantId,
      familyId,
    );

    this.eventEmitter.emit(
      AUTH_EVENTS.LOGIN_SUCCESS,
      new LoginSuccessEvent({
        tenantId,
        userId: user.id,
        ipAddress,
        userAgent,
      }),
    );

    return { accessToken, refreshToken, user };
  }

  async loginWithSlug(
    email: string,
    password: string,
    slug: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    const tenant = await this.tenantRepository.findBySlug(slug);
    if (!tenant) throw new Error(`Tenant ${slug} not found`);

    await this.tenantContext.run(tenant.id, () =>
      this.login({ email, password }, ip, userAgent),
    );
  }

  async refresh(rawRefreshToken: string, ipAddress: string, userAgent: string) {
    const tenantId = this.tenantContext.requireTenantId();
    return this.tokenService.rotateRefreshToken(
      rawRefreshToken,
      tenantId,
      ipAddress,
      userAgent,
    );
  }

  async logout(
    familyId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const tenantId = this.tenantContext.requireTenantId();
    await this.tokenService.revokeFamily(familyId);

    this.eventEmitter.emit(
      AUTH_EVENTS.LOGOUT,
      new LogoutEvent({
        tenantId,
        userId,
        familyId,
        logoutAll: false,
        ipAddress,
        userAgent,
      }),
    );
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string, ipAddress: string, userAgent: string) {
    const tenantId = this.tenantContext.requireTenantId();
    await this.tokenService.revokeAllUserTokens(userId);
    this.eventEmitter.emit(
      AUTH_EVENTS.LOGOUT,
      new LogoutEvent({
        tenantId,
        userId,
        familyId: 'all',
        logoutAll: true,
        ipAddress,
        userAgent,
      }),
    );
    return { message: 'Logged out from all devices' };
  }
}
