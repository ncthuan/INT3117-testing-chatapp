import * as moment from 'moment'
import { v4 as uuid } from 'uuid';

export interface UploadInfo {
  uploadUrl: string;
  uploadToken: string;
}

export interface UploadResult {
  success: boolean;
  path: string;
  contentType: string
}

export interface UploadParams {
  userId: string | number;
  serviceName: string;
  extension?: string;
  name?: string;
  directory?: string;
}
// File storage project structure will be in following format
// bucket_id://<user_id>/<service_name>/<file_type>/<file_name>
// temporatory upload folder: bucket_id://tmp/yyyy-MM-dd/
export abstract class FileUploaderService {

  public abstract generate(params: UploadParams): Promise<UploadInfo>;
  public abstract finishUpload(token: string): Promise<UploadResult>;
  public abstract getUrl(path: string): Promise<string>;

  protected getTempUploadPath(params: UploadParams): string {
    const currentDateString = moment().utc().format('YYYY-MM-DD');
    const fileName = params.name ? params.name : uuid();
    return `tmp/${currentDateString}/${fileName}`
  }

  protected getUploadPath(params: UploadParams): string {
    const fileName = params.name ? params.name : uuid();
    const directory = params.directory ? params.directory : 'file';

    const fullPath = `${params.userId}/${params.serviceName}/${directory}/${fileName}`;
    if (params.extension) {
      return fullPath + '.' + params.extension.toLowerCase();
    }
    return fullPath;
  }
}
