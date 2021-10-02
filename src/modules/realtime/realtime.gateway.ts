import { ClassSerializerInterceptor, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { WsAuth } from '../../decorators/auth.decorator';
import { WebSocketExceptionFilter } from '../../filters/ws-exception.filter';
import { WsJwtAuthGuard } from '../../guards/auth.guard';
import { JWTUtils } from '../../shared/classes/jwt-utils';
import { ConfigService } from '../../shared/services/config.service';
import { AppLoggerService, LoggerFactory } from '../../shared/services/logger.service';
import { ClientData } from './client-data';
import { EventDto } from './dto/event.dto';

const validationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  // dismissDefaultMessages: true,
  validationError: {
    target: false,
  },
  // exceptionFactory: (errors) => new BadRequestException(errors),
});

@WebSocketGateway()
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(validationPipe)
@UseFilters(WebSocketExceptionFilter)
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private logger: AppLoggerService = LoggerFactory.create(RealtimeGateway);

  @WebSocketServer()
  public readonly server: Server;

  private clientData: ClientData = new ClientData();

  constructor(private configService: ConfigService) {
  }


  async afterInit(server: any) {
    this.logger.log('INIT WEB SOCKET.IO GW');
  }

  async handleDisconnect(client: any) {
    this.logger.log('handleDisconnect', client.id);
  }

  //Only accept client which has authen token connect to this realtime gateway
  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const jwtToken = client.handshake.auth.token;
      if (!jwtToken) {
        this.logger.debug('missing authen token', client.handshake);
        client.disconnect();
        return;
      }
      this.logger.debug('handleConnection', {id: client.id, handshake: client.handshake});
      const verifyResult = await JWTUtils.verifyAsync(jwtToken, this.configService.jwt.accessTokenSecret);
      await client.join('user:' + verifyResult.id);
    } catch(err) {
      this.logger.error('verify token error', err);
      client.disconnect();
    }
  }

  // @UseGuards(WsJwtAuthGuard)
  // @WsAuth()
  // @SubscribeMessage('events')
  // findAll(@MessageBody() data: EventDto, @ConnectedSocket() client: Socket): Observable<WsResponse<number>> {
  //   console.log('findAll client', {id: client.id, auth: client.handshake});
  //   console.log('Event data', data, typeof data);
  //   console.log('findAll', this.clientData.get(client.id, 'userId'));
  //   return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  // }

  // @SubscribeMessage('identity')
  // async identity(@MessageBody() data: number): Promise<number> {
  //   return data;
  // }
}
