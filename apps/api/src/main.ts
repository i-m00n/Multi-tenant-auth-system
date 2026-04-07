import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { logger } from './common/logger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useLogger({
    log: (msg) => logger.info(msg),
    error: (msg) => logger.error(msg),
    warn: (msg) => logger.warn(msg),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.requestId = uuid();
    next();
  });

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap', err);
});
