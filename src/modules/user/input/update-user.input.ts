import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../database/entities/user.entity';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  fullName: string;

  @IsOptional()
  @ApiProperty()
  uploadToken: string;

  @IsOptional()
  @IsEnum(UserStatus)
  @ApiProperty({ enum: UserStatus })
  status: UserStatus;
}

export class NotificationSettingDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  enableNotification: boolean;
}