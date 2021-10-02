import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class AddUserInput {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({each: true})
  userIds: string[];
}
