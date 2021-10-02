// Core package
import { Controller, Post, Body, Delete } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

// This module
import { Auth } from '../../decorators/auth.decorator';
import { DeviceService } from './device.service';
import { RequestUser } from '../../decorators/request-user.decorator';
import { AuthPayload } from '../auth/dto/auth-payload.dto';
import { RegisterDeviceInput } from './input/register-device.input';

@Controller('devices')
@ApiTags('Devices')
@Auth()
export class DeviceController {
  constructor(
    private deviceService: DeviceService,
  ) {
  }

  @Post()
  @ApiOkResponse()
  async registerDevice(@RequestUser() user: AuthPayload, @Body() device: RegisterDeviceInput) {
    const userId = user.id;
    await this.deviceService.register(device, userId);
  }

  @Delete()
  @ApiOkResponse()
  async unregisterDevice(@RequestUser() user: AuthPayload, @Body() device: RegisterDeviceInput) {
    const userId = user.id;
    await this.deviceService.unregister(device.token, userId);
  }
}
