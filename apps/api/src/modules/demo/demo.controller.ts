import { Controller, Post, HttpCode } from '@nestjs/common';
import { DemoService } from './demo.service';
import { Public } from 'src/common/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('demo')
export class DemoController {
  constructor(private demoService: DemoService) {}

  @Post('seed')
  @Public()
  @SkipThrottle()
  @HttpCode(200)
  seed() {
    return this.demoService.seed();
  }
}
