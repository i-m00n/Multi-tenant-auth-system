import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodType, treeifyError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: treeifyError(result.error),
      });
    }

    return result.data;
  }
}
