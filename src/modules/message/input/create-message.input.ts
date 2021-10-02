import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateMessageInput {
  @IsNotEmpty()
  @ApiProperty()
  roomId: string;

  @IsOptional()
  @ApiProperty({required: false})
  message: string;

  @ApiProperty({ isArray: true, type: 'string'})
  @IsNotEmpty()
  @IsOptional()
  @Allow()
  uploadedTokens: string[];

  @IsOptional()
  @MaxLength(36)
  @ApiProperty({required: false, description: 'client set this value to prevent duplicated message'})
  clientId: string;
}
