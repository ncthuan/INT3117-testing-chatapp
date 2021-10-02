import { Catch, ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { LoggerFactory } from '../shared/services/logger.service';
import { AppException } from '../exceptions/app-exception';
import { CommandResponseDto } from '../common/dto/command-response.dto';

@Catch(Error)
export class WebSocketExceptionFilter implements WsExceptionFilter<AppException> {
  private logger = LoggerFactory.create(this.constructor.name);
  catch(exception: AppException, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToWs();
    const client = ctx.getClient();
    const request = ctx.getData();

    const errorDto = new CommandResponseDto();

    if (exception instanceof AppException) {
      errorDto.code = exception.code;
      errorDto.message = exception.message;
      errorDto.data = exception.data;
    } else {
      errorDto.code = 'BAD_REQUEST';
      errorDto.message = (exception as any).message;
    }

    this.logger.error(exception.message, {
      request,
      exception,
    });

    client.emit('exception', errorDto)

    return of(errorDto);
  }
}
