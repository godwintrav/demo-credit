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

      if (!userId || Number.isNaN(parseInt(userId))) {
        res.status(400).json({ message: INVALID_USER });
        return;
      }

      const validatedUserId = parseInt(userId);

      const response: TransactionsApiResponse =
        await this.transactionService.getAllUserTransactions(validatedUserId);

      if (response.statusCode !== 200) {
        res.status(response.statusCode).json({ message: response.message });
        return;
      }

      res.status(response.statusCode).json({
        message: response.message,
        transactions: response.transactions,
      });
      return;
    } catch (e: unknown) {
      const err: Error = e as Error;
      //log for debugging
      //console.log(err);
      res.status(500).json({ message: err.message });
      return;
    }
  }
}
