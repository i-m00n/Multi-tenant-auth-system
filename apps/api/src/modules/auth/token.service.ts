import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshTokenEntity } from './refresh-token.entity';
import type { StringValue } from 'ms';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  familyId: string;
}

@Injectable()
export class TokenService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow<StringValue>(
        'jwt.accessTokenExpiry',
      ),
    });
  }

  async generateRefreshToken(
    userId: string,
    tenantId: string,
    familyId: string,
    manager?: EntityManager,
  ): Promise<string> {
    const rawToken = randomUUID();
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        this.configService.getOrThrow<number>('jwt.refreshTokenExpiryDays'),
    );

    const tokenRepo = manager
      ? manager.getRepository(RefreshTokenEntity)
      : this.refreshTokenRepository;

    await tokenRepo.save(
      tokenRepo.create({
        tokenHash,
        familyId,
        userId,
        tenantId,
        expiresAt,
      }),
    );
    return rawToken;
  }

  async rotateRefreshToken(
    rawToken: string,
    tenantId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(rawToken);

    return this.dataSource.transaction(async (manager) => {
      const tokenRepo = manager.getRepository(RefreshTokenEntity);

      const stored = await tokenRepo.findOne({
        where: { tokenHash, isRevoked: false },
      });

      if (!stored) {
        const maybeRevoked = await tokenRepo.findOne({
          where: { tokenHash },
        });

        if (maybeRevoked) {
          await tokenRepo.update(
            { familyId: maybeRevoked.familyId },
            { isRevoked: true },
          );
          throw new UnauthorizedException(
            'Token reuse detected. Session terminated.',
          );
        }

        throw new UnauthorizedException('Invalid refresh token');
      }

      if (stored.expiresAt < new Date()) {
        await tokenRepo.update({ tokenHash }, { isRevoked: true });
        throw new UnauthorizedException('Refresh token expired');
      }

      await tokenRepo.update({ tokenHash }, { isRevoked: true });

      const newRefreshToken = await this.generateRefreshToken(
        stored.userId,
        tenantId,
        stored.familyId,
        manager,
      );

      const accessToken = this.generateAccessToken({
        sub: stored.userId,
        email: '',
        tenantId,
        familyId: stored.familyId,
      });

      return { accessToken, refreshToken: newRefreshToken };
    });
  }

  async revokeFamily(familyId: string) {
    await this.refreshTokenRepository.revokeFamilyById(familyId);
  }

  async revokeAllUserTokens(userId: string) {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
