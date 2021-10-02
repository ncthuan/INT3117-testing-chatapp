import { AWSS3FileUploader } from './services/aws-s3-file-uploader.service';
import { Global, Module } from '@nestjs/common';

import { ConfigService } from './services/config.service';
import { RedisClientService } from './services/redis.service';
import { FileUploaderService } from './services/file-uploader.service';

const uploaderService = {
  provide: 'FILE_SERVICE',
  useFactory: async (configService: ConfigService) => {
    const config = configService.aws;
    const uploader: FileUploaderService = new AWSS3FileUploader({
      accessKey: config.key,
      secretKey: config.secret,
      region: config.region,
      bucket: config.bucket,
      baseUrl: config.s3url,
    });
    return uploader;
  },
  inject: [ConfigService],
};

const providers = [ConfigService, RedisClientService, uploaderService];

@Global()
@Module({
  providers:providers,
  exports: [...providers],
})
export class SharedModule {}
