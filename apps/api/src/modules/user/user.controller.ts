import { Controller, Post, Body, HttpCode, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import * as userSchemas from './user.schemas';
import { Public } from 'src/common/decorators/public.decorator';
import {
  RateLimit,
  registerKeyStrategy,
} from 'src/common/decorators/rate-limit.decorator';
import express from 'express';
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
    @Body(new ZodValidationPipe(userSchemas.RegisterUserSchema))
    @Req()
    req: express.Request,
    dto: userSchemas.RegisterUserDto,
  ) {
    const ip = req.ip ?? '';
    const ua = req.headers['user-agent'] ?? '';
    return this.userService.register(dto, ip, ua);
  }
}
