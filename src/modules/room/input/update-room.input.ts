import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRoomInput {
  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  avatarUploadToken?: string;
}

export class MuteInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  mute: boolean;
}

export class BlockUserInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  block: boolean;
}