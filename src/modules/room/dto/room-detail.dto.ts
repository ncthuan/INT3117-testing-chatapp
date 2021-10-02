import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ObjectID } from 'typeorm';
import { RoomRole, UserRoom } from '@db/entities/user-room.entity';
import { RoomType } from '@db/entities/room.entity';
import { UserStatus } from '@db/entities/user.entity';

export class UserRoomDto {
  @Transform((params) => params.value?.toString(), { toPlainOnly: true })
  @Type(() => String)
  @ApiProperty({ type: String })
  _id: ObjectID;

  @ApiProperty()
  role: RoomRole;

  @ApiProperty()
  username: string;
  
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  avatar: string;

  constructor(input: UserRoom) {
    this._id = input.userId;
    this.role = input.role;
    this.username = input.username;
    this.fullName = input.fullName;
    this.avatar = input.avatar;
  }
}

export class RoomDetailDto {
  @Transform((params) => params.value?.toString(), { toPlainOnly: true })
  @Type(() => String)
  @ApiProperty({ type: String })
  _id: ObjectID;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: RoomType;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ isArray: true, type: UserRoomDto })
  users: UserRoomDto[];

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

  @ApiProperty()
  isMuted: boolean;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  blockList: string[];

  constructor(room: Partial<RoomDetailDto>, userRooms: UserRoom[], userId: string) {
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
    this.blockList = room.blockList;
    this.users = userRooms?.map((userRoom) => new UserRoomDto(userRoom));
    if (room.type == RoomType.direct) {
      const thisUserRoom = userRooms?.find(userRoom => userRoom.userId.toHexString() === userId);
      this.isMuted = thisUserRoom?.isMuted;
      const directUserRoom = userRooms?.find(userRoom => userRoom.userId.toHexString() != userId);
      if (directUserRoom) {
        this.name = directUserRoom.fullName;
        this.avatar = directUserRoom.avatar;
        this.status = directUserRoom.status;
        this.isRead = directUserRoom.lastSeenAt > this.lastMessageTime;
      }
    }
  }
}
