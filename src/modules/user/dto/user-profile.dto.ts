import { ApiProperty } from '@nestjs/swagger';
import { User, UserRole, UserStatus } from '../../../database/entities/user.entity';

class EmailDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  verified: boolean;
}

class UserSettingDto {
  @ApiProperty()
  enableNotification: boolean;

  @ApiProperty()
  language: string;

  @ApiProperty()
  preferences: any;
}

export class MeDto { // user profile DTO
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ isArray: true, type: EmailDto })
  emails: EmailDto[];

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  roles: UserRole[];

  @ApiProperty()
  avatar: string;

  @ApiProperty({ type: UserSettingDto })
  settings: UserSettingDto;

  constructor(user: User) {
    this._id = user._id.toHexString();
    this.name = user.fullName;
    this.username = user.username;
    this.emails = user.emails;
    this.status = user.status;
    this.roles = user.roles;
    this.avatar = user.avatar;
    this.settings = user.settings;
  }
}

export class UploadInfoDto {
  @ApiProperty()
  uploadUrl: string;

  @ApiProperty()
  uploadToken: string;
}
