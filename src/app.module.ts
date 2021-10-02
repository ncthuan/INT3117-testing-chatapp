import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import {
  I18nModule,
  I18nJsonParser,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import path = require('path');
import { ExtractUserMiddleware } from './middleware/extract-user.middleware';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { DeviceModule } from './modules/device/device.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RoomModule } from './modules/room/room.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { MessageModule } from './modules/message/message.module';
import { ContactModule } from './modules/contact/contact.module';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from './shared/services/config.service';

@Module({
  imports: [
    SharedModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    DeviceModule,
    RealtimeModule,
    RoomModule,
    MessageModule,
    ContactModule,
    ScheduleModule,
    ExtractUserMiddleware,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, '/i18n/'),
      },
      resolvers: [AcceptLanguageResolver],
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      imports: [SharedModule],
      useFactory: async (configService: ConfigService) => ({
        redis: configService.redisUrl
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): boolean {
    consumer.apply(ExtractUserMiddleware).forRoutes('*');
    return true;
  }
}
