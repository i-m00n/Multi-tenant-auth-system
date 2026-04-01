import { Controller, Post, Body, Res, HttpCode, Req } from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import * as authSchemas from './auth.schemas';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import {
  RateLimit,
  loginKeyStrategy,
  refreshKeyStrategy,
} from 'src/common/decorators/rate-limit.decorator';

@Controller(':tenant/api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private setRefreshCookie(res: express.Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this.configService.get<string>('app.env') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms, matches DB expiry
      path: '/',
    });
  }

  private clearRefreshCookie(res: express.Response) {
    res.clearCookie('refresh_token', { path: '/' });
  }

  @Post('login')
  @Public()
  @HttpCode(200)
  @RateLimit({
    limit: 5,
    windowSeconds: 900,
    keyStrategy: loginKeyStrategy,
  })
  async login(
    @Body(new ZodValidationPipe(authSchemas.LoginSchema))
    dto: authSchemas.LoginDto,
    @Res({ passthrough: true }) res: express.Response,
    @Req() req: express.Request,
  ) {
    const ip = req.ip ?? '';
    const ua = req.headers['user-agent'] ?? '';
    const { accessToken, refreshToken, user } = await this.authService.login(
      dto,
      ip,
      ua,
    );

    this.setRefreshCookie(res, refreshToken);

    // refreshToken never in response body - it's in a (httpOnly cookie) only
    return { accessToken, user };
  }

  @Post('refresh')
  @Public()
  @HttpCode(200)
  @RateLimit({
    limit: 20,
    windowSeconds: 900,
    keyStrategy: refreshKeyStrategy,
  })
  async refresh(
    @Cookies('refresh_token') token: string | undefined,
    @Res({ passthrough: true }) res: express.Response,
    @Req() req: express.Request,
  ) {
    const ip = req.ip ?? '';
    const ua = req.headers['user-agent'] ?? '';

    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const { accessToken, refreshToken } = await this.authService.refresh(
      token,
      ip,
      ua,
    );

    // rotate the cookie with the new token
    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @CurrentUser() user: { id: string; familyId: string },
    @Res({ passthrough: true }) res: express.Response,
    @Req() req: express.Request,
  ) {
    const ip = req.ip ?? '';
    const ua = req.headers['user-agent'] ?? '';
    await this.authService.logout(user.familyId, user.id, ip, ua);
    this.clearRefreshCookie(res);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @HttpCode(200)
  async logoutAll(
    @CurrentUser() user: { id: string },
    @Res({ passthrough: true }) res: express.Response,
    @Req() req: express.Request,
  ) {
    const ip = req.ip ?? '';
    const ua = req.headers['user-agent'] ?? '';
    await this.authService.logoutAll(user.id, ip, ua);
    this.clearRefreshCookie(res);
    return { message: 'Logged out from all devices' };
  }
}
