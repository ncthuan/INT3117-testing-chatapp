import { UserRole } from '../database/entities/user.entity';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard, WsJwtAuthGuard } from '../guards/auth.guard';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized"' }),
  );
}


export function WsAuth(...roles: UserRole[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(WsJwtAuthGuard, RolesGuard),
  );
}
