import { AuthPayload } from '@modules/auth/dto/auth-payload.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/auth.decorator';
import { RequestUser } from 'src/decorators/request-user.decorator';
import { RoomDetailDto } from './dto/room-detail.dto';
import { RoomListDto } from './dto/room-list.dto';
import { CreateRoomInput } from './input/create-room.input';
import { QueryRoomInput } from './input/query-room.input';
import { UpdateRoomInput, MuteInput, BlockUserInput } from './input/update-room.input';
import { RoomService } from './room.service';
import { AddUserInput } from '@modules/room/input/add-user-input';
import { RemoveUserInput } from '@modules/room/input/remove-user-input';


@Controller('rooms')
@Auth()
@ApiTags('Rooms')
export class RoomController {

  constructor(private readonly roomService: RoomService) {

  }

  @Get()
  @ApiOkResponse({type: RoomListDto})
  async findAll(@Query() query: QueryRoomInput, @RequestUser() user: AuthPayload): Promise<RoomListDto> {
    return this.roomService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOkResponse({type: RoomDetailDto})
  async findOne(@Param('id') id: string, @RequestUser() user: AuthPayload): Promise<RoomDetailDto> {
    return this.roomService.findOne(id, user.id);
  }

  @Post()
  @ApiOkResponse({type: RoomDetailDto})
  async create(@Body() input: CreateRoomInput, @RequestUser() user: AuthPayload): Promise<RoomDetailDto> {
    return this.roomService.create(input, user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @RequestUser() user: AuthPayload, @Body() input: UpdateRoomInput) {
    return this.roomService.update(id, user.id, input);
  }

  @Post(':id/mute')
  async mute(@Param('id') id: string, @RequestUser() user: AuthPayload, @Body() input: MuteInput) {
    return this.roomService.mute(id, user.id, input.mute);
  }

  @Post(':id/leave')
  async leave(@Param('id') id: string, @RequestUser() user: AuthPayload) {
    return this.roomService.leave(id, user.id);
  }

  @Post(':id/block')
  async blockUser(@Param('id') id: string, @RequestUser() user: AuthPayload, @Body() input: BlockUserInput) {
    return this.roomService.blockUser(id, user.id, input);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @RequestUser() user: AuthPayload) {
    return this.roomService.delete(id, user.id);
  }

  @Post(':id/add-member')
  async addUser(@Param('id') id: string, @RequestUser() user: AuthPayload, @Body() input: AddUserInput) {
    return this.roomService.addMember(id, user.id, input);
  }

  @Post(':id/remove-user')
  async removeUser(@Param('id') id: string, @RequestUser() user: AuthPayload, @Body() input: RemoveUserInput) {
    return this.roomService.removeMember(id, user.id, input);
  }
}
