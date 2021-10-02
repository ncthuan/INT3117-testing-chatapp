import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomType } from '../../../database/entities/room.entity';

export class CreateRoomInput {
  @ApiProperty({enum: RoomType})
  @IsEnum(RoomType)
  type: RoomType;

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({each: true})
  userIds: string[];

  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  avatarFileId?: string;
}
