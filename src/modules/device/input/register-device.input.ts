import { DevicePlatform } from '../../../database/entities/device.entity';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceInput {
  @IsNotEmpty()
  @ApiProperty({required: true})
  token: string;

  @IsEnum(DevicePlatform)
  @ApiProperty({type: DevicePlatform, enum: DevicePlatform, required: true})
  platform: DevicePlatform;
}
