import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetContactsDto {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  keyword: string;

  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  roomId: string;

  @IsOptional()
  @ApiProperty({ type: 'number', required: false })
  @Transform(param => parseInt(param.value.toString()))
  limit: number;

  @IsOptional()
  @ApiProperty({ type: 'number', required: false })
  @Transform(param => parseInt(param.value.toString()))
  offset: number;
}
