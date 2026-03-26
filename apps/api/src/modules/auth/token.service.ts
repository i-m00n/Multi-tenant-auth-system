import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { RefreshTokenRepository } from './refresh-token.repository';
import type { StringValue } from 'ms';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  tenantId: string;
  familyId: string; // session identifier — same for the whole refresh family
}

@Injectable()
export class TokenService {
  constructor(
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
  ): Promise<string> {
    const rawToken = randomUUID();
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        this.configService.getOrThrow<number>('jwt.refreshTokenExpiryDays'), // 7
    );

    await this.refreshTokenRepository.createToken({
      tokenHash,
      familyId,
      userId,
      tenantId,
      expiresAt,
    });

    return rawToken; // return raw — only time it's ever in plaintext
  }

  async rotateRefreshToken(
    rawToken: string,
    tenantId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored) {
      // token not found — could be expired or never existed
      // check if this hash belongs to a revoked token (replay attack)
      const maybeRevoked = await this.refreshTokenRepository.findOne({
        where: { tokenHash },
      });

      if (maybeRevoked) {
        // token exists but is revoked → REPLAY ATTACK
        // kill the entire session family immediately
        await this.refreshTokenRepository.revokeFamilyById(
          maybeRevoked.familyId,
        );
        throw new UnauthorizedException(
          'Token reuse detected. Session terminated.',
        );
      }

      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      await this.refreshTokenRepository.revokeToken(tokenHash);
      throw new UnauthorizedException('Refresh token expired');
    }

    // revoke current token before issuing new one
    await this.refreshTokenRepository.revokeToken(tokenHash);

    // issue new pair with same familyId
    const newRefreshToken = await this.generateRefreshToken(
      stored.userId,
      tenantId,
      stored.familyId,
    );

    const accessToken = this.generateAccessToken({
      sub: stored.userId,
      email: '', // will be populated from user lookup in auth.service
      tenantId,
      familyId: stored.familyId,
    });

    return { accessToken, refreshToken: newRefreshToken };
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
