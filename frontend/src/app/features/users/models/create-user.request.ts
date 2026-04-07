import { UserRole } from './user-role.type';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}
