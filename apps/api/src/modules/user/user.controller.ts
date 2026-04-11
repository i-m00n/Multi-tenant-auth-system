import { Controller, Post, Body, HttpCode, Req, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import * as userSchemas from './user.schemas';
import { Public } from 'src/common/decorators/public.decorator';
import {
  RateLimit,
  registerKeyStrategy,
} from 'src/common/decorators/rate-limit.decorator';
import express from 'express';
import * as tokenService from '@modules/auth/token.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PERMISSIONS } from '@modules/rbac/permissions.constants';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
@Controller(':tenant/api/auth')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  @Public()
  @HttpCode(201)
  @RateLimit({
    limit: 10,
    windowSeconds: 3600,
    keyStrategy: registerKeyStrategy,
  })
  register(
    @Req() req: express.Request,
    @Body(new ZodValidationPipe(userSchemas.RegisterUserSchema))
    dto: userSchemas.RegisterUserDto,
  ) {
    const ip = req.ip ?? '';
    const ua = req.headers['user-agent'] ?? '';
    return this.userService.register(dto, ip, ua);
  }
}

@Controller(':tenant/api/users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_READ)
  async getAll(@CurrentUser() user: tokenService.JwtPayload) {
    return this.userService.findAllByTenant(user.tenantId);
  }
}
