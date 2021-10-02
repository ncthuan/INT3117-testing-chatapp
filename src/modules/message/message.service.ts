import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { MongoEntityManager } from 'typeorm';
import { ObjectId } from 'mongodb';

import { ErrorCode } from '@common/constants/errors';
import { Attachment, FileType, Message, MessageType } from '@db/entities/message.entity';
import { Room } from '@db/entities/room.entity';
import { AppException } from '../../exceptions/app-exception';
import { AppLoggerService, LoggerFactory } from '@shared/services/logger.service';
import { CreateMessageInput } from './input/create-message.input';
import { UpdateMessageInput } from './input/update-message.input';
import { UserRoom } from '@db/entities/user-room.entity';
import { QueryMessageInput } from './input/query-message.input';
import { AppConfig } from '@common/constants/app-config';
import { MessageDto, MessageListDto } from './dto/message.dto';
import { EventEmitter2 } from 'eventemitter2';
import { RoomEvent, RoomEventName, RoomEventType } from '@common/events/room.event';
import { FileUploaderService } from '@shared/services/file-uploader.service';

@Injectable()
export class MessageService {
  private logger: AppLoggerService = LoggerFactory.create(MessageService);
  constructor(
    @InjectEntityManager()
    private readonly entityManager: MongoEntityManager,
    private eventEmitter: EventEmitter2,
    @Inject('FILE_SERVICE')
    private readonly fileUploaderService : FileUploaderService,
  ) {}
  async create(input: CreateMessageInput, userId: string) {
    const room = await this.entityManager.findOne(Room, {
      where: {
        _id: ObjectId(input.roomId),
        userIds: userId,
      }
    });
    if (!room) throw AppException.error(ErrorCode.ROOM_NOT_FOUND);
    if (room.blockList?.includes(userId)) throw AppException.error(ErrorCode.YOU_ARE_BLOCKED);

    const message = this.entityManager.create(Message, {
      roomId: input.roomId,
      clientId: input.clientId,
      senderId: userId,
    });
    if (input.message) {
      message.message = input.message;
      message.type = MessageType.text;
    }
    if (input.uploadedTokens && input.uploadedTokens.length) {
      const files = [];
      for (const token of input.uploadedTokens) {
        const { success, path, contentType } = await this.fileUploaderService.finishUpload(token);
        if (success && path) {
          const previewImage = await this.fileUploaderService.getUrl(path);
          const type = contentType.split('/')[0];
          let fileType = FileType.image;
          if (type == FileType.image) {
            fileType = FileType.image
          } else if (type == FileType.video) {
            fileType = FileType.video
          } else {
            fileType = FileType.other
          }
          files.push(new Attachment(path, previewImage, fileType))
        }
      }
      message.attachments = files;
      if (files[0].type == MessageType.image) {
        message.type = MessageType.image
      } else if (files[0].type == MessageType.video) {
        message.type = MessageType.video
      } else {
        message.type = MessageType.other
      }
    }
    await this.entityManager.save(message);
    await this.entityManager.updateOne(
      Room,
      { _id: new ObjectId(message.roomId) },
      {
        $set: {
          lastMessage: message.message,
          lastMessageId: message._id.toHexString(),
          lastMessageTime: message.createdAt,
          lastMessageUserId: message.senderId,
        },
      },
    );
    await this.entityManager.updateMany(
      UserRoom,
      { roomId: message.roomId },
      {
        $inc: {
          unreadCount: 1,
        },
      },
    );

    const dto = new MessageDto(message);
    // Emit event to listener in realtime
    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<MessageDto>({
        type: RoomEventType.messageCreated,
        roomId: message.roomId,
        senderId: userId,
        payload: dto,
      }),
    );

    return dto;
  }

  async findAll(query: QueryMessageInput, userId: string) {
    const userRoom = await this.entityManager.findOne(UserRoom, {
      roomId: ObjectId(query.roomId),
      userId: ObjectId(userId),
    });
    if (!userRoom) throw AppException.error(ErrorCode.ROOM_NOT_FOUND);

    const prevLimit = query.prevLimit ?? AppConfig.PAGE_SIZE_DEFAULT;
    const nextLimit = query.nextLimit ?? AppConfig.PAGE_SIZE_DEFAULT;
    const messageTime = query.messageTime ?? Date.now();

    let prevMessages: Message[] = [];
    let nextMessages: Message[] = [];
    //get prev message
    if (prevLimit > 0) {
      prevMessages = await this.entityManager.find(Message, {
        where: {
          roomId: query.roomId,
          $and: [
            { createdAt: { $lt: new Date(messageTime) } },
            { createdAt: { $gt: userRoom.clearAt } },
          ],
          ...(query.includeDeleted ? {} : { isDeleted: { $ne: true } }),
        },
        order: {
          createdAt: 'DESC',
        },
        take: prevLimit,
      });
    }
    if (nextLimit > 0) {
      nextMessages = await this.entityManager.find(Message, {
        where: {
          roomId: query.roomId,
          $or: [
            ...(query.includeUpdated || query.includeDeleted ? [{ updatedAt: { $gt: new Date(messageTime) } }] : []),
            { createdAt: { $gt: new Date(Math.max(messageTime, userRoom.clearAt.valueOf())) } },
          ],
          ...(query.includeDeleted ? {} : { isDeleted: { $ne: true } }),
        },
        order: {
          createdAt: 'ASC',
        },
        take: nextLimit,
      });
    }

    const messageResult: Message[] = [...prevMessages.reverse(), ...nextMessages];
    if (query.reverse) {
      messageResult.reverse();
    }

    return new MessageListDto(messageResult);
  }

  async findOne(id: string) {
    const existingMessage = await this.entityManager.findOne(Message, id);
    //TODO: check permission

    return new MessageDto(existingMessage);
  }

  async update(id: string, input: UpdateMessageInput, userId: string) {
    const existingMessage = await this.entityManager.findOne(Message, id);
    if (existingMessage.senderId != userId) throw new UnauthorizedException();

    await this.entityManager.updateOne(
      Message,
      { _id: new ObjectId(id) },
      {
        $set: {
          message: input.message,
          updatedAt: new Date(),
        }
      },
    );
    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<Partial<MessageDto>>({
        type: RoomEventType.messageEdited,
        roomId: existingMessage.roomId,
        senderId: userId,
        payload: {
          _id: existingMessage._id,
          message: input.message,
          isEdited: true,
        },
      }),
    );
  }

  async delete(id: string, userId: string) {
    const existingMessage = await this.entityManager.findOne(Message, id);
    if (existingMessage.senderId != userId) throw new UnauthorizedException();

    await this.entityManager.updateOne(
      Message,
      { _id: new ObjectId(id) },
      {
        $unset: {
          message: '',
          attachments: '',
        },
        $set: {
          isDeleted: true,
          updatedAt: new Date(),
        },
      },
    );
    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<Partial<MessageDto>>({
        type: RoomEventType.messageDeleted,
        roomId: existingMessage.roomId,
        senderId: userId,
        payload: {
          _id: existingMessage._id,
          isDeleted: true,
        },
      }),
    );
  }

  async markAsRead(roomId: string, userId: string) {
    await this.entityManager.updateOne(UserRoom, {
        roomId: ObjectId(roomId),
        userId: ObjectId(userId)
      }, {
        $set: {
          lastSeenAt: new Date(),
          unreadCount: 0,
          updatedAt: new Date(),
        },
      },
    );
    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<any>({
        type: RoomEventType.messageRead,
        roomId: roomId,
        senderId: userId,
        payload: {},
      }),
    );
  }
}
