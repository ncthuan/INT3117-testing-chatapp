import { UserType, UserRole } from '../../../database/entities/user.entity';

export interface AuthPayload {
  id: string;
  fullName: string;
  roles: UserRole[];
  type: UserType;
}
