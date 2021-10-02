import { NestMiddleware, Injectable } from '@nestjs/common';
import { JWTUtils } from '../shared/classes/jwt-utils';
import { ConfigService } from '../shared/services/config.service';

@Injectable()
export class ExtractUserMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: any, res: any, next: () => void) {
    const authHeaders = req.headers.authorization;
    if (authHeaders && (authHeaders as string).split(' ')[1]) {
      const token = (authHeaders as string).split(' ')[1];
      JWTUtils.verifyAsync(token, this.configService.jwt.accessTokenSecret)
      .then(decoded => {
        req.user = decoded;
      }).finally(() => {
        next();
      });
    } else {
      next();
    }
  }
}
