// Core package
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { MongoEntityManager, Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

// This module
import { CreateUserInput } from './input/create-user.input';
import { UserUpdateDto } from './input/update-user.input';

// Other import
import { AppException } from '../../exceptions/app-exception';
import { ErrorCode } from '../../common/constants/errors';
import { FileUploaderService } from '../../shared/services/file-uploader.service';
import { Email, User, UserRole, UserSetting, UserStatus, UserType } from '../../database/entities/user.entity';
import { UserRoom } from '../../database/entities/user-room.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: MongoEntityManager,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('FILE_SERVICE')
    private readonly fileUploaderService : FileUploaderService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async emit(name: string, payload: any) {
    return this.eventEmitter.emit(name, payload)
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { 'emails.address': { $eq: email }},
    });
    await this.validateUserStatus(user);
    return user;
  }

  async getUserById(id: string, transform = false): Promise<User> {
    const user = await this.userRepository.findOne(id);
    await this.validateUserStatus(user);
    if (transform) {
      user.avatar = user.avatar ? await this.fileUploaderService.getUrl(user.avatar) : '';
    }
    return user;
  }

  private async validateUserStatus(user: User) {
    if (!user || user.status === UserStatus.DELETED) {
      throw AppException.error(ErrorCode.USER_NOT_FOUND);
    }
    if (user.status === UserStatus.BANNED) {
      throw AppException.error(ErrorCode.USER_IS_NOT_ACTIVE);
    }
  }

  async createUser(data: CreateUserInput): Promise<User> {
    // Check existing email
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw AppException.error(ErrorCode.USERNAME_ALREADY_EXISTS);
    }

    const user = this.userRepository.create({
      username: data.username,
      fullName: data.fullName,
      password: data.password,
      type: UserType.USER,
      roles: [UserRole.USER],
      settings: new UserSetting(),
    });
    user.emails = [ new Email(data.email) ];
    
    return this.userRepository.save(user);
  }

  async update(userId: string, userData: UserUpdateDto): Promise<User> {
    const user = await this.getUserById(userId);
    const updates: Partial<User> = {}

    if (userData.uploadToken) {
      const { success, path } = await this.fileUploaderService.finishUpload(userData.uploadToken);
      if (success && path) {
        updates.avatar = path;
      }
    }
    if (userData.fullName && userData.fullName.length) {
      updates.fullName = userData.fullName;
    }
    if (userData.status) {
      updates.status = userData.status;
    }
    const updatedUser = await this.entityManager.save(User, Object.assign(user, updates));
    this.entityManager.updateMany(UserRoom, {userId: ObjectId(userId) }, { $set: updates })
    .then(() => {
      // TODO emit event user info change to other users
    });
    return updatedUser;
  }

}
