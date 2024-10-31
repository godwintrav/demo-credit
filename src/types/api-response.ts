import { User } from '../modules/user/user.interface';

export interface CreateUserApiResponse {
  statusCode: number;
  user?: Partial<User>;
  message: string;
}

export interface LoginUserApiResponse {
  statusCode: number;
  user?: Partial<User>;
  message: string;
  token?: string;
}
