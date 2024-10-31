import { Knex } from 'knex';
import { User } from '../../interfaces/user.interface';
import { Account } from '../../interfaces/account.interface';

//class for database interaction with user database
export class UserModel {
  constructor(private readonly db: Knex) {}

  //create a new user and new account
  async insert(user: Omit<User, 'id'>): Promise<number> {
    try {
      return await this.db.transaction(async (trx) => {
        const response = await trx<User>('users').insert(user);
        const [newUserId] = response;

        // Insert account for the new user
        await trx<Account>('accounts').insert({ user_id: newUserId });

        return newUserId;
      });
    } catch (e: unknown) {
      // If we get here, that means that neither the 'user' insert,
      // nor 'account' inserts will have taken place beacuse we used transaction.
      const err: Error = e as Error;
      //console.error(err);
      throw new Error('Transaction failed: ' + err.message);
    }
  }

  //get user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    const user: User | undefined = await this.db<User>('users')
      .where({ email })
      .first();
    return user;
  }

  //get user by Id
  async findUserById(id: number): Promise<User | undefined> {
    const user: User | undefined = await this.db<User>('users')
      .where({ id })
      .first();
    return user;
  }
}
