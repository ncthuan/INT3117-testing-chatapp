import { Injectable } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as JWT from 'jsonwebtoken';
import * as Mime from 'mime-types';
import * as Path from 'path';
import * as Url from 'url';

import { FileUploaderService, UploadParams, UploadInfo, UploadResult } from './file-uploader.service';

const s3Expire7Day = 604800;

export interface AWSS3Options {
  accessKey: string;
  secretKey: string;
  region: string;
  bucket: string;
  expire?: number;
  baseUrl: string;
}

export enum ThumbSize {
  SMALL = '100x100',
  MEDIUM = '512x512',
  LARGE = '1080x1080',
}


@Injectable()
export class AWSS3FileUploader extends FileUploaderService {
  private readonly s3: S3;

  constructor(private readonly options: AWSS3Options) {
    super();
    this.s3 = new S3({
      credentials: {
        accessKeyId: options.accessKey,
        secretAccessKey: options.secretKey,
      },
      region: options.region,
    });
  }

  public async generate(params: UploadParams): Promise<UploadInfo> {
    const tmpPath = this.getTempUploadPath(params);
    const uploadPath = this.getUploadPath(params);
    const uploadUrl = await this.getS3SignedUploadUrl(tmpPath);
    const uploadToken = JWT.sign({tmp: tmpPath, path: uploadPath}, this.options.secretKey, {expiresIn: '7d'});

    return {uploadUrl, uploadToken};
  }

  public async finishUpload(token: string): Promise<UploadResult> {
    const decoded: any = JWT.verify(token, this.options.secretKey);
    const tmp: string = decoded.tmp;

    const extension = Path.extname(tmp);
    const contentType = Mime.lookup(extension) || 'application/octet-stream';

    const path: string = decoded.path;
    await this.move(tmp, path);

    return { success: true, path , contentType };
  }

  public async deleteFile(path: string) {
    const bucket = this.options.bucket;
    const deleteParams = {
      Bucket : bucket,
      Key : path
    };

    await this.s3.deleteObject(deleteParams);
  }

  private async getS3SignedUploadUrl(path: string) {
    const bucket = this.options.bucket;
    const extension = Path.extname(path);
    const contentType = Mime.lookup(extension) || 'application/octet-stream';
    const expireDuration = this.options.expire || s3Expire7Day;
    const params = {
      Bucket: bucket,
      Key: path,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);

    return getSignedUrl(this.s3, command, {expiresIn: expireDuration});
  }

  public async getS3SignedGetUrl(path: string) {
    const bucket = this.options.bucket;
    const expireDuration = this.options.expire || s3Expire7Day;
    const params = {
      Bucket: bucket,
      Key: path,
    };

    const command = new GetObjectCommand(params);
    return getSignedUrl(this.s3, command, {expiresIn: expireDuration});
  }

  private async move(path: string, newPath: string) {
    const bucket = this.options.bucket
    const copyParams = {
      Bucket : bucket,
      CopySource : encodeURI('/' + bucket + '/' + path),
      Key : newPath,
    };
    await this.s3.copyObject(copyParams);

    const deleteParams = {
      Bucket : bucket,
      Key : path
    };

    await this.s3.deleteObject(deleteParams);
  }

  public async getUrl(path: string) {
    if (!path) { return null; }

    const url = Url.parse(path);
    if (url.host) { return path; }
    return `${this.options.baseUrl}${path}`;

    // if (size) {
    //   return `${this.options.baseUrl}/${size}${path}`;
    // } else {
    //   return `${this.options.baseUrl}${path}`;
    // }
  }
}
