import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { DevicePlatform } from '../../../database/entities/device.entity';
import { Trim } from '../../../decorators/transforms.decorator';

export class LoginInput {
  @Trim()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
