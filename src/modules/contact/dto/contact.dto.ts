import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ObjectID } from 'typeorm';

export class Contact {
  @Transform((params) =>  params.value?.toString(),  {toPlainOnly:  true})
  @ApiProperty({type: String})
  _id: ObjectID;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(input: Partial<Contact>) {
    this._id = input._id;
    this.username = input.username;
    this.email = input.email;
    this.fullName = input.fullName;
    this.avatar = input.avatar;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
}
