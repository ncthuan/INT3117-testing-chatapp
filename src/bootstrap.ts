import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { I18nService } from 'nestjs-i18n';
import * as requestIp from 'request-ip';

import { AppModule } from './app.module';
import { SharedModule } from './shared/shared.module';
import { ConfigService } from './shared/services/config.service';
import { LoggerFactory } from './shared/services/logger.service';
import { setupSwagger } from './swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { RedisIoAdapter } from './modules/realtime/redis-io.adapter';

const bootstrap = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule);
  const configService = app.select(SharedModule).get(ConfigService);
  const i18nService = app.select(AppModule).get(I18nService);
  LoggerFactory.setLevel(configService.logLevel);

  app.useGlobalFilters(new HttpExceptionFilter(i18nService));
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // dismissDefaultMessages: true,
      validationError: {
        target: false,
      },
      // exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );

  const corsOptions: CorsOptions = {
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'Language', 'Content-Disposition', 'Timezone'],
    optionsSuccessStatus: 200,
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    exposedHeaders: ['Content-Disposition']
  };
  app.enableCors(corsOptions);

  app.use(requestIp.mw());

  app.useWebSocketAdapter(new RedisIoAdapter(app, configService.redisUrl));

  app.setGlobalPrefix('api');
  // app.enableVersioning({ type: VersioningType.URI });

  setupSwagger(app, configService.basePath);
  await app.listen(configService.port);

  return app;
}

export default bootstrap;
