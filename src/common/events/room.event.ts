import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { MessageDto } from "@modules/message/dto/message.dto";
import { RoomDetailDto } from "@modules/room/dto/room-detail.dto";
import { BlockUserInput } from "@modules/room/input/update-room.input";
import { RemoveUserInput } from '@modules/room/input/remove-user-input';

export const RoomEventName = 'room.events';
export enum RoomEventType {
  roomCreated = 'room.created',
  roomUpdated = 'room.updated',
  roomBlocked = 'room.blocked',
  roomAddUser = 'room.add.user',
  roomRemoveUser = 'room.remove.user',
  roomLeave = 'room.leave',
  messageCreated = 'message.created',
  messageEdited = 'message.edited',
  messageDeleted = 'message.deleted',
  messageRead = 'message.read',
}

export class RoomEvent<T> {
  @ApiProperty({ enum: RoomEventType })
  type: RoomEventType;

  @ApiProperty()
  roomId: string;

  @ApiProperty({ required: false })
  senderId?: string;

  @ApiProperty({
    required: false,
    oneOf: [
      { $ref: getSchemaPath(RoomDetailDto) },
      { $ref: getSchemaPath(MessageDto) },
      { $ref: getSchemaPath(BlockUserInput) },
      { $ref: getSchemaPath(RemoveUserInput) },
    ],
  })
  payload?: T;

  constructor(payload: Required<RoomEvent<T>>) {
    Object.assign(this, payload);
  }
}
