import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateMessageInput {
  @IsNotEmpty()
  @ApiProperty({required: true})
  message: string;
}
