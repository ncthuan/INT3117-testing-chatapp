import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import * as Redis from 'ioredis';
import { ConfigService } from './config.service';

@Injectable()
export class RedisClientService {
  private redis: Redis.Redis;
  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(configService.redisUrl);
  }

  async get(key: string): Promise<any> {
    const value = await this.redis.get(key);
    return JSON.parse(value);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async set(
    key: string,
    value: any,
    expiryMode?: string | any[],
    time?: number | string,
    setMode?: number | string,
  ): Promise<any> {
    if (setMode) {
      return this.redis.set(
        key,
        JSON.stringify(value),
        expiryMode,
        time,
        setMode,
      );
    } else {
      return this.redis.set(key, JSON.stringify(value), expiryMode, time);
    }
  }
  async storeValue(key: string, value: any, timeoutSeconds = 0, lock = false): Promise<any> {
    return this.set(key, value, 'EX', timeoutSeconds, lock ? 'NX' : null);
  }

  async del(key: string) {
    return this.redis.del(key);
  }
}
