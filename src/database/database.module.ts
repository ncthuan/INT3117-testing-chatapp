import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../shared/services/config.service';
import { SharedModule } from '../shared/shared.module';
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ SharedModule ],
      inject: [ ConfigService ],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.db.url,
        authSource: 'admin',
        entities: [__dirname + '/entities/*.entity.{ts,js}'],
        logging: configService.db.log,
        migrationsRun: true,
        migrationsTransactionMode: 'each',
        migrations: [__dirname + '/migrations/*.{ts,js}'],
        useUnifiedTopology: true,
        synchronize: true, // only sync index so it's safe
      }),
    }),
  ],
})
export class DatabaseModule {

}
