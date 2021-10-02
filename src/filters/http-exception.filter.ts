import {
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
  Catch,
  BadRequestException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  LoggerFactory,
} from '../shared/services/logger.service';
import { ErrorDto } from '../common/dto/error.dto';
import { AppException } from '../exceptions/app-exception';

@Catch(AppException, HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = LoggerFactory.create(this.constructor.name);
  constructor(private readonly i18n: I18nService) {}
  async catch(exception: HttpException | AppException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    let statusCode = 500;
    const errorDto = new ErrorDto();
    // tslint:disable-next-line: no-string-literal
    const lang = request['i18nLang'];

    if (exception instanceof AppException) {
      statusCode = 400;
      errorDto.code = exception.code;
      errorDto.message = await this.i18n.translate(
        `errors.${exception.code}`,
        { lang },
      );
      errorDto.data = exception.data;
    } else if (exception instanceof BadRequestException) {
      statusCode = exception.getStatus();
      // Normaly validation error
      errorDto.code = 'BAD_REQUEST';
      const exceptionResponse: any = exception.getResponse();
      const errors = exceptionResponse.message;
      if (Array.isArray(errors) && errors.length > 0) {
        const translatedMessages: string[] = [];
        for(const error of errors) {
          const message = await this.i18n.translate(
            `errors.${error}`,
            { lang },
          );
          translatedMessages.push(message);
        }
        errorDto.message = translatedMessages.join('\n');
        errorDto.data = errors;
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorDto.code = 'HTTP_EXCEPTION_' + exception.getStatus();
      errorDto.message = exception.message;
    }

    this.logger.error(exception.message, {
      requestUrl: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
      exception,
    });

    response.status(statusCode).json(errorDto);
  }
}
