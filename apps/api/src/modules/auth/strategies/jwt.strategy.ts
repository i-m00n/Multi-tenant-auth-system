import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserRepository } from '../../user/user.repository';
import { UserEntity } from '../../user/user.entity';
import { TenantContext } from '../../tenant/tenant-context.service';
import type { JwtPayload } from '../token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
    private tenantContext: TenantContext,
  ) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
      passReqToCallback: true,
    };
    super(options);
  }

  async validate(
    _req: Request,
    payload: JwtPayload,
  ): Promise<{
    id: string;
    email: string;
    tenantId: string;
    familyId: string;
  }> {
    const currentTenantId = this.tenantContext.requireTenantId();

    if (payload.tenantId !== currentTenantId) {
      throw new UnauthorizedException('Token tenant mismatch');
    }

    const user: UserEntity | null = await this.userRepository.findOneById(
      payload.sub,
    );
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      familyId: payload.familyId,
    };
  }
}
