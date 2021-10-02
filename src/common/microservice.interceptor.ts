import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { classToPlain } from 'class-transformer';
import { CommandResponseDto } from './dto/command-response.dto';

export class MicroserviceInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(map(data => {
      const result = (data instanceof CommandResponseDto) ? data : CommandResponseDto.success(data);
      return classToPlain(result);
    }));
  }

}
