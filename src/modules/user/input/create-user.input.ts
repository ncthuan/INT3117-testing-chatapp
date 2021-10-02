import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInput {
  @ApiProperty()
  username: string;

  @ApiProperty()
  fullName?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  avatar?: string;

  constructor(payload: Partial<CreateUserInput>) {
    this.username = payload.username;
    this.fullName = payload.fullName;
    this.email = payload.email;
    this.password = payload.password;
    this.avatar = payload.avatar;
  }
}
