import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, Max } from 'class-validator';
import { ToBoolean } from '../../../decorators/transforms.decorator';

export class QueryMessageInput {
  @IsNotEmpty()
  @ApiProperty()
  roomId: string;

  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    required: false,
    description:
    `Specifies the timestamp to be the reference point of the query, in 'Unix milliseconds'.`
  })
  messageTime: number;

  // @IsOptional()
  // @ApiProperty({
  //   required: false,
  //   description:
  //   `Specifies the unique ID of the message to be the reference point of the query.
  //   Either this or 'messageTime' parameter above should be specified in your query URL to retrieve a list.`
  // })
  // messageId: string;

  @IsOptional()
  @Type(() => Number)
  @Max(1000)
  @ApiProperty({required: false})
  prevLimit: number;

  @IsOptional()
  @Type(() => Number)
  @Max(1000)
  @ApiProperty({required: false})
  nextLimit: number;

  @IsOptional()
  @ToBoolean()
  // @Type(() => Boolean)
  @ApiProperty({
    required: false,
    default: false,
    description:
    `Determines whether to sort the results in reverse order.
    If true, returns a list of messages which the latest comes at first and the earliest at last. the results are sorted in reverse order.
    If false, returns a list of messages which the earliest comes at first and the latest at last.
    (Default: false)`
  })
  reverse: boolean;

  @IsOptional()
  @ToBoolean()
  // @Type(() => Boolean)
  @ApiProperty({required: false, default: false})
  includeDeleted: boolean;

  @IsOptional()
  @ToBoolean()
  // @Type(() => Boolean)
  @ApiProperty({required: false, default: false})
  includeUpdated: boolean;
}
