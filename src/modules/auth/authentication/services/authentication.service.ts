// Core package
import { Injectable } from '@nestjs/common';
import { MongoEntityManager } from 'typeorm';
import { ObjectID } from 'mongodb';

// This module
import { PasswordTransformer } from '../../../../database/transformers/password.transfomer';
import { AppException } from '../../../../exceptions/app-exception';
import { ErrorCode } from '../../../../common/constants/errors';
import { User, UserType, UserRole, UserStatus, Email, UserSetting } from '../../../../database/entities/user.entity';
import { LoginInput } from '../../input/login.input';
import { RegisterInput } from '../../input/register.input';
import { AuthTokenDto } from '../../dto/auth-token.dto';
import { CreateUserInput } from '../../../user/input/create-user.input';
import { AuthPayload } from '../../dto/auth-payload.dto';
import { InjectEntityManager } from '@nestjs/typeorm';

// Other module
import { LoggerFactory } from '../../../../shared/services/logger.service';
import { ConfigService } from '../../../../shared/services/config.service';
import { JWTUtils } from '../../../../shared/classes/jwt-utils';

// Define variable

@Injectable()
export class AuthenticationService {
  private readonly logger = LoggerFactory.create(AuthenticationService);
  constructor(
    private readonly configService: ConfigService,
    @InjectEntityManager()
    private readonly entityManager: MongoEntityManager
  ) {}

  get jwt() {
    return this.configService.jwt;
  }

  async login(loginDto: LoginInput) {
    const user = await this.validateLogin(loginDto);
    return this.createToken(user);
  }

  async refreshToken(token: string) {
    try {
      const result: {id: string} = await JWTUtils.verifyAsync(token, this.jwt.refreshTokenSecret);
      const user = await this.entityManager.findOne(User, {_id: ObjectID(result.id)});
      await this.validateUserStatus(user);
      const authToken = await this.createToken(user);
      return authToken;
    }
    catch(error) {
      this.logger.error('refresh error', error);
      if (error instanceof AppException) {
        throw error;
      } else {
        throw AppException.error(ErrorCode.INVALID_REFRESH_TOKEN);
      }
    }
  }

  private async validateLogin(loginDto: LoginInput): Promise<User> {
    const user = await this.entityManager.findOne(User, {username: loginDto.username});
    if (!user) {
      this.logger.warn('Username not found', loginDto.username);
      throw AppException.error(ErrorCode.USER_PASSWORD_NOT_MATCH);
    }
    // verify password
    const verifyResult = await PasswordTransformer.compare(loginDto.password, user.password);
    if (!verifyResult) {
      throw AppException.error(ErrorCode.USER_PASSWORD_NOT_MATCH);
    }

    await this.validateUserStatus(user);

    return user;
  }

  async register(registerDto: RegisterInput): Promise<AuthTokenDto> {
    const data = new CreateUserInput(registerDto);

    const createdUser = await this.createUser(data);

    return this.createToken(createdUser);
  }

  private async createUser(data: CreateUserInput): Promise<User> {
    // Check existing user
    let findCriteria: any = { username: data.username };
    if (data.email) findCriteria = {
      $or: [
        { username: data.username },
        { 'emails.address': { $eq: data.email } },
      ]
    }
    const existingUser = await this.entityManager.findOne(User, {
      where: findCriteria,
    });
    if (existingUser) {
      throw AppException.error( existingUser.username === data.username ?
        ErrorCode.USERNAME_ALREADY_EXISTS :
        ErrorCode.EMAIL_EXISTED
      );
    }

    const user = this.entityManager.create(User, {
      username: data.username,
      fullName: data.fullName,
      password: data.password,
      type: UserType.USER,
      roles: [UserRole.USER],
      settings: new UserSetting(),
    });
    if (data.email) user.emails = [ new Email(data.email) ];

    return this.entityManager.save(user);
  }

  private async validateUserStatus(user: User) {
    if (!user || user.status === UserStatus.DELETED) {
      throw AppException.error(ErrorCode.USER_NOT_FOUND);
    }
    if (user.status === UserStatus.BANNED) {
      throw AppException.error(ErrorCode.USER_IS_NOT_ACTIVE);
    }
  }

  private async createToken(user: User): Promise<AuthTokenDto> {
    const payload: AuthPayload = {
      id: user._id.toHexString(),
      fullName: user.fullName,
      roles: user.roles,
      type: user.type
    };
    const authToken = await JWTUtils.signAsync(payload, this.jwt.accessTokenSecret, {expiresIn: this.configService.jwt.accessTokenExpireTime});
    const refreshToken = await JWTUtils.signAsync({id: user._id.toHexString()}, this.jwt.refreshTokenSecret, {expiresIn: this.configService.jwt.refreshTokenExpireTime});
    return new AuthTokenDto(authToken, refreshToken, user);
  }

}
