import { Knex } from 'knex';
import { User } from './user.interface';

//class for database interaction with user database
export class UserModel {
  constructor(private readonly db: Knex) {}

  //create a new user
  async insert(user: Omit<User, 'id'>): Promise<number> {
    const response = await this.db<User>('users').insert(user);
    const [newUserId] = response;
    return newUserId;
  }

  //get user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.db<User>('users').where({ email }).first();
    return user;
  }

  //get user by Id
  async findUserById(id: number): Promise<User | undefined> {
    const user = await this.db<User>('users').where({ id }).first();
    return user;
  }
}
