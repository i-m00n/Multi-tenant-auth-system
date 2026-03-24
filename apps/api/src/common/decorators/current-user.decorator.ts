import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/modules/user/user.entity';

interface AuthenticatedRequest extends Request {
  user: UserEntity;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
