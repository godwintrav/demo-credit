import { SUCCESS_MSG, USER_NOT_FOUND } from '../../utils/constants';
import { TransactionsApiResponse } from '../../interfaces/api-response.interface';
import { Transaction } from '../../interfaces/transaction.interface';
import { TransactionModel } from './transaction.model';
import { UserModel } from '../user/user.model';
import { User } from '../../interfaces/user.interface';
import { errorResponse } from '../../utils/errorResponse';

//This class handles business logic for users
export class TransactionService {
  constructor(
    private readonly transactionModel: TransactionModel,
    private readonly userModel: UserModel,
  ) {}

  async getAllUserTransactions(
    userId: number,
  ): Promise<TransactionsApiResponse> {
    const user: User | undefined = await this.userModel.findUserById(userId);
    if (!user) {
      return errorResponse(USER_NOT_FOUND, 404);
    }
    const transactions: Transaction[] =
      await this.transactionModel.getUserTransactions(userId);
    return { message: SUCCESS_MSG, statusCode: 200, transactions };
  }
}
