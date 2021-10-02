import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  message: string;

  @ApiProperty({required: false})
  data?: any;
}
