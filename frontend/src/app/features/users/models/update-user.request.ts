import { UserRole } from './user-role.type';

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
