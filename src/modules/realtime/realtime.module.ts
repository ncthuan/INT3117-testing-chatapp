import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { RoomEventListener, RealtimeQueueConsumer } from './room-event.listener';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'realtime',
      defaultJobOptions: {
        timeout: 5000, // job will auto remove after 5 seconds
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 1,
      }
    }),
  ],
  providers: [
    RealtimeGateway,
    RoomEventListener,
    RealtimeQueueConsumer,
  ]
})
export class RealtimeModule {}
