import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Trim, Lowercased } from '../../../decorators/transforms.decorator';

export class RegisterInput {
  @IsNotEmpty()
  @Trim()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({minLength: 3, maxLength: 50})
  username: string;

  @IsNotEmpty()
  @Trim()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({minLength: 3, maxLength: 50})
  fullName?: string;

  @Trim()
  @Lowercased()
  @IsOptional()
  @IsEmail({allow_utf8_local_part: false}, {message: 'EMAIL_INVALID_FORMAT'})
  @ApiProperty({required: false})
  email?: string;

  @IsNotEmpty()
  @MinLength(6, {message: 'PASSWORD_MIN_LENGTH_6'})
  @MaxLength(32, {message: 'PASSWORD_MAX_LENGTH_32'})
  @ApiProperty({minLength: 6, maxLength: 32})
  password: string;
}
