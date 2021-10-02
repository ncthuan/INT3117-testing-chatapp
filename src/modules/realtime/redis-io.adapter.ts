import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from 'socket.io-redis';
import * as Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private redisAdapter: any;
  constructor(appOrHttpServer: INestApplicationContext | any, private readonly redisUrl: string) {
    super(appOrHttpServer);
    const pubClient = new Redis(redisUrl);
    const subClient = pubClient.duplicate();
    this.redisAdapter = createAdapter({ pubClient, subClient });
  }
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.redisAdapter);
    return server;
  }
}
