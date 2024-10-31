import { Account } from './account.interface';
import { User } from './user.interface';

export interface ApiResponse {
  statusCode: number;
  message: string;
}

export interface CreateUserApiResponse extends ApiResponse {
  user?: Partial<User>;
}

export interface LoginUserApiResponse extends ApiResponse {
  user?: Partial<User>;
  token?: string;
}

export interface AccountApiResponse extends ApiResponse {
  account?: Partial<Account>;
  user?: Partial<User>;
}
