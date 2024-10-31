import { Knex } from 'knex';
import { Account } from './account.interface';

//class for database interaction with account database
export class AccountModel {
  constructor(private readonly db: Knex) {}

  //get Account by Id
  async findAccountById(id: number): Promise<Account | undefined> {
    const account = await this.db<Account>('accounts').where({ id }).first();
    return account;
  }

  // Update an existing account by ID
  async update(
    id: number,
    accountUpdates: Partial<Omit<Account, 'id'>>,
  ): Promise<number> {
    const updatedCount = await this.db<Account>('accounts')
      .where({ id })
      .update(accountUpdates);

    if (updatedCount === 0) {
      throw new Error('No account found with the provided id');
    }

    return updatedCount;
  }
}
