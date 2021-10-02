import { Injectable } from '@nestjs/common';
import { CronExpression, Cron } from '@nestjs/schedule';
import { RedisClientService } from '../../shared/services/redis.service';
import { InjectLogger, AppLoggerService } from '../../shared/services/logger.service';

function Locker(): MethodDecorator {
  return function(_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function() {
      if (this.tryLock !== 'undefined') {
          const aquiredLock = await this.tryLock(propertyKey);
          if (aquiredLock) {
            original.apply(this);
            if (typeof aquiredLock === 'function') {
              await aquiredLock();
            }
          }
      } else {
        original.apply(this);
      }
    };
  };
}

@Injectable()
export class ScheduleService {
  @InjectLogger()
  private readonly logger: AppLoggerService;
  private readonly keyPrefix = 'This is my key';
  constructor(private readonly redisClient: RedisClientService) {}

  async tryLock(key: string): Promise<any> {
    const value = Date.now();
    const redisKey = this.keyPrefix + key;
    const setResult = await this.redisClient.set(redisKey, value, 'EX', 10, 'NX'); // try lock for 10s

    // this.logger.log('tryLock', setResult);

    if (!setResult) {
      return false;
    } else {
      return async () => {
        await this.redisClient.del(redisKey);
      };
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  @Locker()
  async handleCron() {
    // this.logger.log('handleCron');
  }
}
