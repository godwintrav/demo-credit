import { Knex } from 'knex';
import { Account } from '../../interfaces/account.interface';
import { UserAccount } from '../../interfaces/user-account.interface';
import { Transaction } from '../../interfaces/transaction.interface';

//class for database interaction with account database
export class AccountModel {
  constructor(private readonly db: Knex) {}

  //get Account by Id
  async findAccountById(user_id: number): Promise<Account | undefined> {
    const account = await this.db<Account>('accounts')
      .where({ user_id })
      .first();
    return account;
  }

  async findAccountByEmail(email: string): Promise<Account | undefined> {
    const account = await this.db<Account>('accounts')
      .select('accounts.*')
      .innerJoin('users', 'users.id', 'accounts.user_id')
      .where('users.email', email)
      .first();
    return account;
  }

  async findUserAndAccountById(
    userId: number,
  ): Promise<UserAccount | undefined> {
    const account = await this.db<Account>('accounts')
      .select(
        'accounts.*',
        'users.email',
        'users.name',
        'users.date_of_birth',
        'users.city',
        'users.address',
        'users.lga_id',
      )
      .innerJoin('users', 'users.id', 'accounts.user_id')
      .where('users.id', userId)
      .first();
    return account;
  }

  // Update an existing account by ID
  async updateAccount(
    account_id: number,
    accountUpdates: Partial<Omit<Account, 'id'>>,
  ): Promise<number> {
    const updatedCount = await this.db<Account>('accounts')
      .where({ id: account_id })
      .update({ balance: accountUpdates.balance });

    if (updatedCount === 0) {
      throw new Error('No account found with the provided id');
    }

    return updatedCount;
  }

  //update sender and receiver account
  async updateTransfer(
    senderAccountId: number,
    senderAccountUpdates: Partial<Omit<Account, 'id'>>,
    receiverAccountId: number,
    reciverAccountUpdates: Partial<Omit<Account, 'id'>>,
  ): Promise<number> {
    try {
      //use transaction in case any one fails the whole transaction rollsback
      return await this.db.transaction(async (trx) => {
        const updatedSenderCount = await trx<Account>('accounts')
          .where({ id: senderAccountId })
          .update({ balance: senderAccountUpdates.balance });

        if (updatedSenderCount === 0) {
          throw new Error('No account found with the provided sender id');
        }

        const updatedReceiverCount = await trx<Account>('accounts')
          .where({ id: receiverAccountId })
          .update({ balance: reciverAccountUpdates.balance });

        if (updatedReceiverCount === 0) {
          throw new Error('No account found with the provided receiver id');
        }

        return updatedReceiverCount;
      });
    } catch (e: unknown) {
      // If we get here, that means that both updates will not have taken place beacuse we used transaction.
      const err: Error = e as Error;
      //console.error(err);
      throw new Error('Transaction failed: ' + err.message);
    }
  }

  //create transaction
  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<void> {
    await this.db<Transaction>('transactions').insert(transaction);
  }
}
