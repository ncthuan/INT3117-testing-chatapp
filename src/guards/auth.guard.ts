import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggerFactory } from '../shared/services/logger.service';
import { RedisClientService } from '../shared/services/redis.service';
import { JWTUtils } from '../shared/classes/jwt-utils';

// export const JwtAuthGuard = AuthGuard('jwt');
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly redisService: RedisClientService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const jwt = JWTUtils.extractJwt(req);

    const blacklisted = await this.redisService.get(jwt);
    if (blacklisted) throw new UnauthorizedException();

    return (await super.canActivate(context)) as boolean;
  }
}

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = LoggerFactory.create(WsJwtAuthGuard);

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'ws') {
      return false;
    }

    const argsHost = context.switchToWs();
    const client = argsHost.getClient();

    this.logger.verbose('Client handshake', client.handshake);

    return true;
  }
}
