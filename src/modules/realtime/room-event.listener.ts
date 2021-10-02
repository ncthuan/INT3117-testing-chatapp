import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Job, Queue } from 'bull';
import { MongoEntityManager } from 'typeorm';
import { RoomEvent, RoomEventName } from '../../common/events/room.event';
import { Room } from '../../database/entities/room.entity';
import { UserRoom } from '../../database/entities/user-room.entity';
import { AppLoggerService, LoggerFactory } from '../../shared/services/logger.service';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RoomEventListener {
  private logger: AppLoggerService = LoggerFactory.create(RoomEventListener);
  constructor(@InjectQueue('realtime') private realtimeQueue: Queue) {
  }
  @OnEvent(RoomEventName)
  async onReceivedRoomEvent(event: RoomEvent<any>) {
    this.logger.log("onReceivedRoomEvent", event);
    this.realtimeQueue.add(RoomEventName, event);
  }
}

@Processor('realtime')
export class RealtimeQueueConsumer {
  constructor(
    private realtimeGw: RealtimeGateway,
    @InjectEntityManager() private entityManager: MongoEntityManager) {}

  @Process(RoomEventName)
  async processRoomEvent(job: Job<RoomEvent<unknown>>) {
    const event = job.data;
    const room = await this.entityManager.findOne(Room, event.roomId);
    const userIds = room.userIds;

    for (const toUserId of userIds) {
      await this.sendEvent(event, toUserId);
    }
  }

  private async sendEvent(event: RoomEvent<unknown>, toUserId: string) {
    const socketIds = await this.realtimeGw.server.sockets.in('user:' + toUserId).allSockets();
    // the user doesn't connect to gw, send push notification instead
    if (!socketIds || socketIds.size === 0) {
      const userRoom = await this.entityManager.findOne(UserRoom, {userId: toUserId, roomId: event.roomId});
      if (userRoom.isMuted) { // The user turn off notification for this room
        return;
      }
      // TODO: send push notification
    } else { // send event throw socket
      this.realtimeGw.server.sockets.in('user:' + toUserId).emit(RoomEventName, event);
    }
  }
}
