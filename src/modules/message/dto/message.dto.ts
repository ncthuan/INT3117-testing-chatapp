import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ObjectID } from 'typeorm';
import { Message, MessageType } from '@db/entities/message.entity';

export class AttachmentDto {
  @ApiProperty({type: String})
  previewImagePath: string;

  @ApiProperty({type: String})
  type: string;

  constructor(input: Partial<AttachmentDto>) {
    this.previewImagePath = input.previewImagePath;
    this.type = input.type;
  }
}

export class MessageDto {
  @Transform((params) =>  params.value?.toString(),  {toPlainOnly:  true})
  @ApiProperty({type: String})
  _id: ObjectID;

  @ApiProperty({type: String})
  roomId: string;

  @ApiProperty({type: String})
  message: string;

  @ApiProperty({isArray: true, type: AttachmentDto})
  attachments: AttachmentDto[];

  @ApiProperty({type: String})
  clientId: string;

  @ApiProperty({type: String})
  senderId: string;

  @ApiProperty({type: Date})
  createdAt: Date;

  @ApiProperty({type: Date})
  updatedAt: Date;

  @ApiProperty({type: Boolean})
  isDeleted: boolean;

  @ApiProperty({type: Boolean})
  isEdited: boolean;

  @ApiProperty({type: Boolean})
  ts: number;

  @ApiProperty()
  type: MessageType;

  constructor(message: Message) {
    this._id = message._id;
    this.roomId = message.roomId;
    this.message = message.message;
    this.attachments = message.attachments ? message.attachments.map(attachment => new AttachmentDto(attachment)) : [];
    this.clientId = message.clientId;
    this.senderId = message.senderId;
    this.createdAt = message.createdAt;
    this.updatedAt = message.updatedAt;
    this.isDeleted = message.isDeleted;
    this.ts = this.createdAt?.getTime();
    this.isEdited = this.updatedAt.valueOf() != this.createdAt.valueOf();
    this.type = message.type;
  }
}

export class MessageListDto {
  @ApiProperty({isArray: true, type: MessageDto})
  items: MessageDto[]
  constructor(messages: Message[]) {
    this.items = messages.map(message => new MessageDto(message))
  }
}
