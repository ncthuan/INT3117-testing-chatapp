import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { MongoEntityManager } from 'typeorm';
import { ObjectId } from 'mongodb';
import { EventEmitter2 } from 'eventemitter2';
import { RoomEventName, RoomEvent, RoomEventType } from '@common/events/room.event';
import { AppConfig } from '@common/constants/app-config';
import { ErrorCode } from '@common/constants/errors';
import { FileUploaderService } from '@shared/services/file-uploader.service';
import { AppLoggerService, LoggerFactory } from '@shared/services/logger.service';
import { AppException } from 'src/exceptions/app-exception';

import { RoomType, Room } from '@db/entities/room.entity';
import { UserRoom, RoomRole } from '@db/entities/user-room.entity';
import { User } from '@db/entities/user.entity';
import { RoomDetailDto } from './dto/room-detail.dto';
import { RoomSummary, RoomListDto } from './dto/room-list.dto';
import { CreateRoomInput } from './input/create-room.input';
import { QueryRoomInput, QueryRoomOrder } from './input/query-room.input';
import { BlockUserInput, UpdateRoomInput } from './input/update-room.input';
import { PageTokenBuilder } from './page-token-builder';
import { AddUserInput } from '@modules/room/input/add-user-input';
import { RemoveUserInput } from '@modules/room/input/remove-user-input';


@Injectable()
export class RoomService {
  private logger: AppLoggerService = LoggerFactory.create(RoomService);
  constructor(
    @InjectEntityManager()
    private readonly entityManager: MongoEntityManager,
    @Inject('FILE_SERVICE')
    private readonly fileUploaderService: FileUploaderService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(input: CreateRoomInput, userId: string) {
    this.logger.debug('Input', input);

    //Validate users in the room
    const userIdSet = new Set([...input.userIds, userId]);
    const userIds = Array.from(userIdSet).sort();
    const users = await this.entityManager.findByIds(User, userIds);
    if (users.length !== userIds.length) {
      throw AppException.error(ErrorCode.USER_NOT_FOUND);
    }

    //Find if there is any existing room  when user create direct room
    if (input.type === RoomType.direct) {
      const existing = await this.entityManager.findOne(Room, {
        userIds: userIds,
        type: RoomType.direct,
      });
      if (existing) {
        return this.findOne(existing._id.toHexString(), userId);
      }
    }

    const room = this.entityManager.create(Room, {
      type: input.type,
      userIds: userIds,
      lastMessageTime: new Date(), //#001
    });
    if (input.type === RoomType.group) { // direct chat dont need name, avatar, createdBy
      room.avatar = input.avatarFileId;
      room.name = input.name || 'New Group';
      room.createdBy = userId;
    }
    const newRoom = await this.entityManager.save(Room, room);

    //create UserRoom
    const userRooms = users.map((user) => {
      return this.entityManager.create(UserRoom, {
        roomId: newRoom._id,
        userId: user._id,
        joinAt: newRoom.createdAt,
        clearAt: new Date(0), //#001
        lastSeenAt: newRoom.lastMessageTime,
        unreadCount: 0,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        status: user.status,
        role: input.type === RoomType.group && user._id.toHexString() === userId ? RoomRole.owner : undefined,
      });
    });
    const newUserRooms = await this.entityManager.save(UserRoom, userRooms);
    newRoom['users'] = newUserRooms;

    const dto = new RoomDetailDto(room, newUserRooms, userId);
    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<RoomDetailDto>({
        type: RoomEventType.roomCreated,
        roomId: newRoom._id.toHexString(),
        senderId: userId,
        payload: dto,
      }),
    );
    return dto;
  }

  async findAll(input: QueryRoomInput, userId: string) {
    const pageSize = input.limit ? input.limit : AppConfig.PAGE_SIZE_DEFAULT;
    const offset = 0;
    const defaultPaging = {
      createdAt: new Date(),
      skip: offset,
      take: pageSize,
      order:
        input.order === QueryRoomOrder.latest ?
          { lastMessageTime: -1, updatedAt: -1, createdAt: -1 } :
          { createdAt: -1 }
    };
    const pagingToken = input.token ? PageTokenBuilder.extractToken(input.token) : null;
    const pagingObject = pagingToken || defaultPaging;

    const searchConditions = !input.search ? {} :
    {
      direct: {
        userRooms: {
          $elemMatch: {
            userId: { $ne: ObjectId(userId) },
            fullName: { $regex: input.search, $options: "i" },
          }
        }
      },
      group: {
        name: { $regex: input.search, $options: "i" }
      },
    };

    // const rooms = input.search ? await this.search(input.search, pagingObject, userId) : else
    const rooms = await this.entityManager.aggregate<Room,Room>(Room, [
      {
        $match: {
          userIds: userId,
          createdAt: { $lt: pagingObject.createdAt },
        }
      },
      {
        $lookup: { // join user_room
          from: "user_room",
          let: {
            room_id: "$_id",
            lastMessageTime: "$lastMessageTime",
            room_type: "$type",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [ "$roomId", "$$room_id" ] },
                    {
                      $cond: { // if direct room, we need both userRoom entities from the two users
                        if: { $ne: [ "$$room_type", "direct" ] },
                        then: { $eq: [ "$userId", ObjectId(userId) ] },
                        else: true,
                      }
                    },
                    { $lt: [ "$clearAt", "$$lastMessageTime" ] },
                    // #001 only include room with clearAt < lastMessageTime
                  ]
                }
              }
            },
          ],
          as: "userRooms",
        }
      },
      {
        $match: {
          $or: [
            {
              $expr: { $and: [
                { $eq: [ "$type", "direct" ] },
                { $eq: [ {$size: "$userRooms"}, 2 ] },
              ]},
              ...searchConditions.direct,
            },
            {
              $expr: { $and: [
                { $eq: [ "$type", "group" ] },
                { $eq: [ {$size: "$userRooms"}, 1 ] },
              ]},
              ...searchConditions.group,
            },
          ],
        }
      },
      { $sort: {...pagingObject.order} },
      { $skip: pagingObject.skip },
      { $limit: pagingObject.take },
    ])
    .toArray();

    // Construct return DTO
    const roomSummaryList = rooms.map((room) => {
      const thisUserRoom: UserRoom = room['userRooms']?.find(userRoom => userRoom.userId.toHexString() === userId);
      const directUserRoom: UserRoom = room['userRooms']?.find(userRoom => userRoom.userId.toHexString() != userId);
      return new RoomSummary(room, thisUserRoom, directUserRoom);
    });

    // Calculate next page token
    pagingObject.skip += pagingObject.take; // next page
    const nextPageToken = rooms.length === pagingObject.take ? PageTokenBuilder.createToken(pagingObject) : null;

    return new RoomListDto({
      pageSize: pageSize,
      items: roomSummaryList,
      token: nextPageToken,
    });
  }

  async search(search: string, pagingObject: any, userId: string): Promise<Room[]> {
    return await this.entityManager.aggregate<Room,Room>(Room, [
      {
        $match: {
          userIds: userId,
          $text: {$search: search},
        }
      },
      {
        $sort: {
          score: {$meta: "textScore"},
          ...pagingObject.order,
        }
      },
      { $skip: pagingObject.skip },
      { $limit: pagingObject.take },
    ])
    .toArray();
  }

  async findOne(roomId: string, userId: string) {
    const rooms = await this.entityManager.aggregate<Room,Room>(Room, [
      {
        $match: {
          _id: ObjectId(roomId),
          userIds: userId,
        }
      },
      {
        $lookup: { // join user_room
          from: "user_room",
          localField: "_id",
          foreignField: "roomId",
          as: "users",
        }
      },
    ]).toArray();
    const room = rooms.length > 0 ? rooms[0] : undefined;
    if (!room) throw AppException.error(ErrorCode.ROOM_NOT_FOUND);

    return new RoomDetailDto(room, room['users'], userId);
  }

  private async validateRoom(roomId: string, userId: string): Promise<Room> {
    const room = await this.entityManager.findOne(Room, {
      where: {
        _id: ObjectId(roomId),
        userIds: userId,
      }
    });
    if (!room) throw AppException.error(ErrorCode.ROOM_NOT_FOUND);
    return room;
  }

  async update(roomId: string, userId: string, input: UpdateRoomInput) {
    const room = await this.validateRoom(roomId, userId);
    const updates: Partial<Room> = {}

    if (input.name && input.name.length) {
      updates.name = input.name;
    }
    if (input.avatarUploadToken) {
      const { success, path } = await this.fileUploaderService.finishUpload(input.avatarUploadToken);
      if (success && path) {
        updates.avatar = path;
      }
    }
    await this.entityManager.updateOne(Room, { _id: room._id }, { $set: updates });
    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<RoomDetailDto>({
        type: RoomEventType.roomUpdated,
        roomId: roomId,
        senderId: userId,
        payload: updates as RoomDetailDto,
      }),
    );
  }

  async delete(roomId: string, userId: string) {
    await this.validateRoom(roomId, userId);
    await this.entityManager.updateOne(UserRoom, {
      roomId: ObjectId(roomId),
      userId: ObjectId(userId),
    }, {
      $set: { clearAt: new Date() }, // simply clear message and hide the chat
    });
  }

  async mute(roomId: string, userId: string, isMuted: boolean) {
    await this.validateRoom(roomId, userId);
    await this.entityManager.updateOne(UserRoom, {
      roomId: ObjectId(roomId),
      userId: ObjectId(userId),
    }, {
      $set: { isMuted },
    });
  }

  async leave(roomId: string, userId: string) {
    const room = await this.validateRoom(roomId, userId);
    if (room.type === RoomType.direct) throw AppException.error(ErrorCode.CANNOT_LEAVE_DIRECT_CHAT);

    await this.entityManager.updateOne(Room, {
      _id: ObjectId(roomId)
    },
    { $pull: { userIds: userId } },
    );
    await this.entityManager.deleteOne(UserRoom, {
      roomId: ObjectId(roomId),
      userId: ObjectId(userId),
    });
    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<RemoveUserInput>({
        type: RoomEventType.roomLeave,
        roomId: roomId,
        senderId: userId,
        payload: {userId},
      }),
    );
  }

  async blockUser(roomId: string, userId: string, input: BlockUserInput) {
    if (userId === input.userId) throw AppException.error(ErrorCode.CANNOT_SELF_BLOCK);
    const room = await this.validateRoom(roomId, userId);
    if (!room.userIds.includes(input.userId)) throw AppException.error(ErrorCode.USER_NOT_FOUND);
    if (room.blockList?.includes(userId)) throw AppException.error(ErrorCode.YOU_ARE_BLOCKED);

    if (room.type === RoomType.group) {
      const userRoom = await this.entityManager.findOne(UserRoom, { roomId: room._id, userId: ObjectId(userId) });
      const role = userRoom.role;
      if (!role || role != RoomRole.owner && role != RoomRole.admin) throw AppException.error(ErrorCode.UNAUTHORIZED);
    }
    await this.entityManager.updateOne(Room, {
      _id: ObjectId(roomId)
    },
      input.block ? { $addToSet: { blockList: input.userId } } : { $pull: { blockList: input.userId } },
    );
    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<BlockUserInput>({
        type: RoomEventType.roomBlocked,
        roomId: roomId,
        senderId: userId,
        payload: input,
      }),
    );
  }

  async addMember(roomId: string, userId: string, input: AddUserInput) {
    const room = await this.validateRoom(roomId, userId);
    const userRoom = await this.validateUserRoom(roomId, userId);

    //Validate users in the room
    const userIdSet = new Set([...input.userIds]);
    const userIds = Array.from(userIdSet).filter(id => !room.userIds.includes(id)).sort();
    const users = await this.entityManager.findByIds(User, userIds);
    if (users.length !== userIds.length) {
      throw AppException.error(ErrorCode.USER_NOT_FOUND);
    }

    await this.entityManager.updateOne(Room, {
        _id: ObjectId(roomId)
      },
      { $addToSet: { userIds: { $each: userIds } } }
    );
    //create UserRoom
    const userRooms = users.map((user) => {
      return this.entityManager.create(UserRoom, {
        roomId: room._id,
        userId: user._id,
        joinAt: new Date(),
        clearAt: new Date(0),
        lastSeenAt: new Date(),
        unreadCount: 0,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        status: user.status,
        role: undefined,
      });
    });
    const newUserRooms = await this.entityManager.save(UserRoom, userRooms);
    room['users'] = newUserRooms;

    const dto = new RoomDetailDto(room, newUserRooms, userId);
    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<RoomDetailDto>({
        type: RoomEventType.roomAddUser,
        roomId: room._id.toHexString(),
        senderId: userId,
        payload: dto,
      }),
    );
    return dto;
  }

  async validateUserRoom(roomId: string, userId: string): Promise<UserRoom> {
    const userRoom = await this.entityManager.findOne(UserRoom, { roomId: ObjectId(roomId), userId: ObjectId(userId) });
    if (!userRoom) throw AppException.error(ErrorCode.USER_NOT_IN_ROOM);
    const role = userRoom.role;
    if (!role || role != RoomRole.owner && role != RoomRole.admin) throw AppException.error(ErrorCode.UNAUTHORIZED);
    return userRoom;
  }

  async removeMember(roomId: string, userId: string, input: RemoveUserInput) {
    if (userId === input.userId) throw AppException.error(ErrorCode.CANNOT_SELF_REMOVE);
    const room = await this.validateRoom(roomId, userId);
    if (!room.userIds.includes(input.userId)) throw AppException.error(ErrorCode.USER_NOT_FOUND);

    await this.validateUserRoom(roomId, userId);

    await this.entityManager.updateOne(Room, {
        _id: ObjectId(roomId)
      },
      { $pull: { userIds: input.userId } },
    );

    await this.entityManager.deleteOne(UserRoom, {
      roomId: ObjectId(roomId),
      userId: ObjectId(input.userId),
    });

    await this.eventEmitter.emitAsync(
      RoomEventName,
      new RoomEvent<RemoveUserInput>({
        type: RoomEventType.roomRemoveUser,
        roomId: roomId,
        senderId: userId,
        payload: input,
      }),
    );
  }

}
