// Core package
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

// This module
import { RegisterDeviceInput } from './input/register-device.input';

// Other import
import { Device } from '../../database/entities/device.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectEntityManager()
    private readonly writeManager: EntityManager,
  ) {
  }

  async register(info: RegisterDeviceInput, userId: string) {
    let device = await this.writeManager.findOne(Device, { token: info.token });

    if (device) {
      device.userId = userId;
      this.writeManager.merge(Device, device, info);
    } else {
      device = this.writeManager.create(Device, {
        token: info.token,
        platform: info.platform,
        userId,
      });
    }

    return this.writeManager.save(device);
  }

  async unregister(deviceToken: string, userId: string) {
    return this.writeManager.delete(Device, { token: deviceToken, userId: userId });
  }

  async getDevices(userId: string) {
    return this.writeManager.find(Device, {userId});
  }
}
