import { ApiProperty } from '@nestjs/swagger';

export class ListDto<T> {
  @ApiProperty()
  token: string;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  items: T[];

  constructor(input: Partial<ListDto<T>>) {
    Object.assign(this, input);
  }
}
