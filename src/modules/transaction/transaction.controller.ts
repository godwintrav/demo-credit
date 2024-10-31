import { INVALID_USER } from '../../utils/constants';
import { TransactionsApiResponse } from '../../interfaces/api-response.interface';
import { TransactionService } from './transaction.service';
import { Request, Response } from 'express';

//controller handlers for account routes
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  async fetchTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const validatedUserId = parseInt(userId);

      if (!validatedUserId || typeof validatedUserId != 'number') {
        res.status(400).json({ message: INVALID_USER });
        return;
      }

      const response: TransactionsApiResponse =
        await this.transactionService.getAllUserTransactions(validatedUserId);

      res.status(response.statusCode).json({
        transactions: response.transactions,
        message: response.message,
      });
      return;
    } catch (e: unknown) {
      const err: Error = e as Error;
      //console.error(err);
      res.status(500).json({ message: err.message });
      return;
    }
  }
}
