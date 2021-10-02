import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RoomMessageInput {
  @IsNotEmpty()
  @ApiProperty()
  roomId: string;
}
