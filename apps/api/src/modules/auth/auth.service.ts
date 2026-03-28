import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from './token.service';
import { TenantContext } from '../tenant/tenant-context.service';
import { randomUUID } from 'crypto';
import type { LoginDto } from './auth.schemas';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private tenantContext: TenantContext,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.validatePassword(
      dto.email,
      dto.password,
    );
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const tenantId = this.tenantContext.requireTenantId();
    const familyId = randomUUID(); // fresh family = fresh session

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

    return { accessToken, refreshToken, user };
  }

  async refresh(rawRefreshToken: string) {
    const tenantId = this.tenantContext.requireTenantId();
    return this.tokenService.rotateRefreshToken(rawRefreshToken, tenantId);
  }

  async logout(familyId: string) {
    // revokes only the current session
    await this.tokenService.revokeFamily(familyId);
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    // revokes all sessions across all devices
    await this.tokenService.revokeAllUserTokens(userId);
    return { message: 'Logged out from all devices' };
  }
}
