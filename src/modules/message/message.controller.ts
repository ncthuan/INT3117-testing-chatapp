import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageInput } from './input/create-message.input';
import { UpdateMessageInput } from './input/update-message.input';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/auth.decorator';
import { RequestUser } from '../../decorators/request-user.decorator';
import { AuthPayload } from '../auth/dto/auth-payload.dto';
import { QueryMessageInput } from './input/query-message.input';
import { MessageListDto } from './dto/message.dto';
import { RoomMessageInput } from './input/room-message.input';

@Controller('messages')
@Auth()
@ApiTags('Messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(@Body() input: CreateMessageInput, @RequestUser() user: AuthPayload) {
    return this.messageService.create(input, user.id);
  }

  @Get()
  @ApiOkResponse({type: MessageListDto})
  async findAll(@Query() query: QueryMessageInput, @RequestUser() user: AuthPayload): Promise<MessageListDto> {
    return this.messageService.findAll(query, user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @Put('/mark_as_read')
  async markAsRead(@Body() input: RoomMessageInput, @RequestUser() user: AuthPayload) {
    await this.messageService.markAsRead(input.roomId, user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageInput, @RequestUser() user: AuthPayload) {
    await this.messageService.update(id, updateMessageDto, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @RequestUser() user: AuthPayload) {
    return this.messageService.delete(id, user.id);
  }
}
