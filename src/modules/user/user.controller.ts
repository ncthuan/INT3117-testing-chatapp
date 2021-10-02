// Core package
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
// This module
import { UserService } from './user.service';
import { MeDto, UploadInfoDto } from './dto/user-profile.dto';
import { UserUpdateDto } from './input/update-user.input';

// Other import
import { AuthPayload } from '../auth/dto/auth-payload.dto';
import { AppConfig } from '@common/constants/app-config';
import { FileUploaderService, UploadParams} from '@shared/services/file-uploader.service';
import { RequestUser } from '../../decorators/request-user.decorator';
import { Auth } from '../../decorators/auth.decorator';
import { GetSignedUrlDto } from './input/get-signed-url.dto';
import { FileType } from '@db/entities/message.entity';

@Controller('users')
@Auth()
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('FILE_SERVICE')
    private readonly fileUploaderService : FileUploaderService,
  ) {}

  @Get('profile')
  @ApiOkResponse({type: MeDto})
  async getUserProfile(@RequestUser() user: AuthPayload) {
    return new MeDto(await this.userService.getUserById(user.id, true));
  }

  @Get('upload-link')
  @ApiOkResponse({type: UploadInfoDto})
  async getS3SignedUrl(@Query('fileName') fileName: string, @RequestUser() user: AuthPayload) {
    const params : UploadParams = {
      userId: user.id,
      serviceName: AppConfig.UPLOAD_FILE.AVARTAR,
      name: fileName,
      directory: AppConfig.UPLOAD_FILE.IMAGE_FOLDER
    }
    const result = await this.fileUploaderService.generate(params);
    return result;
  }

  @Get('upload-file-conversation')
  @ApiOkResponse({type: UploadInfoDto})
  async getS3SignedUrlMessage(@Query() data: GetSignedUrlDto, @RequestUser() user: AuthPayload) {
    let directory = AppConfig.UPLOAD_FILE.IMAGE_FOLDER;
    if (data.fileType == FileType.video) {
      directory = AppConfig.UPLOAD_FILE.VIDEO_FOLDER
    } else if (data.fileType == FileType.other) {
      directory = AppConfig.UPLOAD_FILE.FILE_FOLDER
    }

    const params : UploadParams = {
      userId: user.id,
      serviceName: AppConfig.UPLOAD_FILE.CONVERSATION,
      name: data.fileName,
      directory: directory
    }
    const result = await this.fileUploaderService.generate(params);
    return result;
  }

  @Post('profile')
  @ApiOkResponse({type: MeDto})
  async updateProfile(@Body() data: UserUpdateDto, @RequestUser() user: AuthPayload) {
    return new MeDto(await this.userService.update(user.id, data));
  }
}
