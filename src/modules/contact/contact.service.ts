import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { MongoEntityManager } from 'typeorm';
import { ObjectId } from 'mongodb';

import { ErrorCode } from '../../common/constants/errors';
import { AppException } from '../../exceptions/app-exception';
import { User } from '../../database/entities/user.entity';
import { GetContactsDto } from './dto/get-contacts.dto';
import { Contact } from './dto/contact.dto';
import { Room } from '../../database/entities/room.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: MongoEntityManager,
  ) {}

  async findAll(data: GetContactsDto) {
    const findObject: { [k: string]: any } = {};
    if (data.keyword || data.roomId) findObject.where = {};
    if (data.keyword) {
      findObject.where.$text = {
        $search: data.keyword
      }
    }
    if (data.roomId) {
      const room = await this.entityManager.findOne(Room,{
        where: { _id: ObjectId(data.roomId) }
      });
      if (!room) throw AppException.error(ErrorCode.ROOM_NOT_FOUND);
      const userIds = room.userIds.reduce((ids , item) => {
        ids.push(ObjectId(item));
        return ids
      },[]);
      findObject.where._id = {
        $nin: userIds
      }
    }
    if (data.limit) {
      findObject.take = data.limit;
    }
    if (data.offset) {
      findObject.skip = data.offset;
    }
    findObject.order = {
      updatedAt: 'DESC',
      fullName: 'ASC',
    };
    const users = await this.entityManager.find(User, findObject);
    return users.map((item) => this.mapUsertoContact(item));
  }

  async findOne(id: string) {
    const user = await this.entityManager.findOne(User, id);
    if (!user) {
      return AppException.error(ErrorCode.USER_NOT_FOUND);
    }
    return this.mapUsertoContact(user);
  }

  private mapUsertoContact(user: User) {
    return new Contact(user);
  }
}
