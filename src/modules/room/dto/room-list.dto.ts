import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { string } from 'joi';
import { ObjectID } from 'typeorm';
import { ListDto } from '@common/dto/list.dto';
import { UserRoom } from '@db/entities/user-room.entity';
import { UserStatus } from '@db/entities/user.entity';
import { RoomType } from '@db/entities/room.entity';

export class RoomSummary {
  @Transform((params) =>  params.value?.toString(),  {toPlainOnly:  true})
  @Type(() => String)
  @ApiProperty({type: string})
  _id: ObjectID;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: RoomType;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  lastMessage: string;

  @ApiProperty()
  lastMessageId: string;

  @ApiProperty()
  lastMessageTime: Date;

  @ApiProperty()
  lastMessageUserId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // props from UserRoom
  @ApiProperty()
  unreadCount: number;

  @ApiProperty()
  isMuted: boolean;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  isRead: boolean;

  constructor(room: Partial<RoomSummary>, thisUserRoom?: UserRoom, directUserRoom?: UserRoom)  {
    this._id = room._id;
    this.name = room.name;
    this.type = room.type;
    this.createdBy = room.createdBy;
    this.avatar = room.avatar;
    this.lastMessage = room.lastMessage;
    this.lastMessageId = room.lastMessageId;
    this.lastMessageTime = room.lastMessageTime;
    this.lastMessageUserId = room.lastMessageUserId;
    this.createdAt = room.createdAt;
    this.updatedAt = room.updatedAt;

    // props from UserRoom
    if (thisUserRoom) {
      this.unreadCount = thisUserRoom.unreadCount;
      this.isMuted = thisUserRoom.isMuted;
    }
    if (directUserRoom) {
      this.name = directUserRoom.fullName;
      this.avatar = directUserRoom.avatar;
      this.status = directUserRoom.status;
      this.isRead = directUserRoom.lastSeenAt > this.lastMessageTime;
    }
  }
}

export class RoomListDto extends ListDto<RoomSummary> {
  @ApiProperty({isArray: true, type: RoomSummary})
  items: RoomSummary[];
}
