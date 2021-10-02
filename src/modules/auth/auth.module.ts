// Core package
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

// This module
import { JwtStrategy } from './authorization/jwt.strategy';
import { AuthenticationService } from './authentication/services/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';

// Other import
import { RedisClientService } from '../../shared/services/redis.service';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthenticationService, JwtStrategy, RedisClientService],
  controllers: [AuthenticationController],
})
export class AuthModule {}
