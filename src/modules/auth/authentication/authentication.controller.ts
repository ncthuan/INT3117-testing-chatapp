// Core package
import { Controller, Body, Post, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

// This module
import { Auth } from '../../../decorators/auth.decorator';
import { AuthTokenDto } from '../dto/auth-token.dto';
import { LoginInput } from '../input/login.input';
import { RefreshTokenInput } from '../input/refresh-token.input';
import { RegisterInput } from '../input/register.input';

// Other import
import { AuthenticationService } from './services/authentication.service';
import { RedisClientService } from '../../../shared/services/redis.service';
import { JWTUtils } from '../../../shared/classes/jwt-utils';

// Define variable

@Controller()
@ApiTags('Authentication / Authorization')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly redisService: RedisClientService,
  ) {}

  @Post('login')
  @ApiOkResponse({
    description: 'Log user in and return access token',
    type: AuthTokenDto,
  })
  async login(@Body() body: LoginInput): Promise<AuthTokenDto> {
    return this.authService.login(body);
  }

  @Post('logout')
  @Auth()
  @ApiOkResponse({ description: 'Log out user' })
  async logout(@Req() req): Promise<void> {
    const jwt = JWTUtils.extractJwt(req);
    const jwtPayload = JWTUtils.decode(jwt, {json: true});
    // blacklist the jwt
    await this.redisService.set(jwt, 'BLACKLIST', 'EXAT', jwtPayload.exp);
  }

  @Post('refresh')
  @ApiOkResponse({
    description: 'Get new access token from an existing token',
    type: AuthTokenDto,
  })
  async refreshToken(@Body() body: RefreshTokenInput): Promise<AuthTokenDto> {
    return this.authService.refreshToken(body.token);
  }

  @Post('register')
  @ApiOkResponse({
    description: 'Register new account with email and password',
    type: AuthTokenDto,
  })
  async createAccount(@Body() body: RegisterInput): Promise<AuthTokenDto> {
    return this.authService.register(body);
  }

}
