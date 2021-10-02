
export class AppException implements Error {
  public data: string | unknown;
  public message: string;
  public code: string;
  public name: string;
  public stack?: string;

  constructor(
    errorCode: string,
    message?: string,
    errorData?: string | unknown,
  ) {
    this.code = errorCode;
    this.name = errorCode;
    this.data = errorData;
    this.message = message;
  }


  static error(
    errorCode: string,
    message?: string,
    errorData?: string | unknown,
  ): AppException {
    return new AppException(errorCode, message, errorData);
  }
}
