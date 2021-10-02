import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenInput {
  @IsNotEmpty()
  @ApiProperty()
  token: string;
}
