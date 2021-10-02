import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../database/entities/user.entity';
import { MeDto } from '../../user/dto/user-profile.dto';

export class AuthTokenDto {
  @ApiProperty()
  authToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: MeDto })
  me: MeDto;

  constructor(authToken: string, refreshToken: string, user: User) {
    this.authToken = authToken;
    this.refreshToken = refreshToken;
    this.me = new MeDto(user);
  }
}
