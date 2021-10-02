import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, Max } from 'class-validator';

export enum QueryRoomOrder {
  latest = 'latest', //sorts by the time of the last message in a descending order. This is effective only when the user_id is specified.
  chronological = 'chronological', //sorts by the time of channel creation in a descending order
}

export class QueryRoomInput {
  @IsOptional()
  @Type(() => Number)
  @Max(1000)
  @ApiProperty({required: false})
  limit?: number;

  @IsOptional()
  @ApiProperty({required: false})
  token?: string;

  @IsOptional()
  @IsEnum(QueryRoomOrder)
  @ApiProperty({
    required: false,
    enum: QueryRoomOrder,
    default: QueryRoomOrder.latest,
    description:
    `\`latestLastMessage\` (default) - sorts by the time of the last message in a descending order.<br/>
    \`chronological\` - sorts by the time of channel creation in a descending order`
  })
  order?: QueryRoomOrder;

  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'This only search for room name. To search for direct chat, combine the results from search contact API',
  })
  search?: string;
}
