import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import * as userSchemas from './user.schemas';
import { Public } from 'src/common/decorators/public.decorator';

@Controller(':tenant/api/auth')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  @Public()
  register(
    @Body(new ZodValidationPipe(userSchemas.RegisterUserSchema))
    dto: userSchemas.RegisterUserDto,
  ) {
    return this.userService.register(dto);
  }
}
