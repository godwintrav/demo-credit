import { Knex } from 'knex';
import { Transaction } from '../../interfaces/transaction.interface';

//class for database interaction with transactions database
export class TransactionModel {
  constructor(private readonly db: Knex) {}

  //get transactions
  async getUserTransactions(user_id: number): Promise<Transaction[]> {
    const transactions: Transaction[] = await this.db<Transaction>(
      'transactions',
    ).where({ user_id });
    return transactions;
  }
}
