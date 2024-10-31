import { TransactionService } from '../transaction.service';
import { TransactionModel } from '../transaction.model';
import { SUCCESS_MSG } from '../../../utils/constants';
import { Transaction } from '../../../interfaces/transaction.interface';
import { TransactionsApiResponse } from '../../../interfaces/api-response.interface';
import mockKnex from '../../../__mocks__/knex';
import type { Knex } from 'knex';

jest.mock('../transaction.model');

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let mockTransactionModel: jest.Mocked<TransactionModel>;

  beforeEach(() => {
    mockTransactionModel = new TransactionModel(
      mockKnex as unknown as Knex,
    ) as jest.Mocked<TransactionModel>;
    transactionService = new TransactionService(mockTransactionModel);
  });

  describe('getAllUserTransactions', () => {
    it('should return success message and list of transactions for a valid user', async () => {
      const userId = 1;
      const transactions: Transaction[] = [
        {
          id: 1,
          user_id: userId,
          transaction_type: 'fund',
          amount: 100,
          created_at: new Date('2024-01-01'),
        },
        {
          id: 2,
          user_id: userId,
          transaction_type: 'withdraw',
          amount: 50,
          created_at: new Date('2024-01-02'),
        },
      ];

      mockTransactionModel.getUserTransactions.mockResolvedValueOnce(
        transactions,
      );

      const response: TransactionsApiResponse =
        await transactionService.getAllUserTransactions(userId);

      expect(response.message).toBe(SUCCESS_MSG);
      expect(response.statusCode).toBe(200);
      expect(response.transactions).toEqual(transactions);
      expect(mockTransactionModel.getUserTransactions).toHaveBeenCalledWith(
        userId,
      );
    });

    it('should return an empty list if the user has no transactions', async () => {
      const userId = 1;
      mockTransactionModel.getUserTransactions.mockResolvedValueOnce([]);

      const response: TransactionsApiResponse =
        await transactionService.getAllUserTransactions(userId);

      expect(response.message).toBe(SUCCESS_MSG);
      expect(response.statusCode).toBe(200);
      expect(response.transactions).toEqual([]);
      expect(mockTransactionModel.getUserTransactions).toHaveBeenCalledWith(
        userId,
      );
    });

    it('should handle errors thrown by the transaction model gracefully', async () => {
      const userId = 1;
      const error = new Error('Database error');
      mockTransactionModel.getUserTransactions.mockRejectedValueOnce(error);

      await expect(
        transactionService.getAllUserTransactions(userId),
      ).rejects.toThrow('Database error');
      expect(mockTransactionModel.getUserTransactions).toHaveBeenCalledWith(
        userId,
      );
    });
  });
});
