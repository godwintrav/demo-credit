import { SUCCESS_MSG } from '../../constants';
import { TransactionsApiResponse } from '../../interfaces/api-response.interface';
import { Transaction } from '../../interfaces/transaction.interface';
import { TransactionModel } from './transaction.model';

//This class handles business logic for users
export class TransactionService {
  constructor(private readonly transactionModel: TransactionModel) {}

  async getAllUserTransactions(
    userId: number,
  ): Promise<TransactionsApiResponse> {
    const transactions: Transaction[] =
      await this.transactionModel.getUserTransactions(userId);
    return { message: SUCCESS_MSG, statusCode: 200, transactions };
  }
}
