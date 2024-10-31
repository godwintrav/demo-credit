import { TransactionModel } from '../transaction.model';
import { Knex } from 'knex';
import { Transaction } from '../../../interfaces/transaction.interface';

jest.mock('knex');

describe('TransactionModel', () => {
  let transactionModel: TransactionModel;
  let mockKnex: jest.Mock;
  const where = jest.fn();

  // Mock transaction data for testing
  const mockTransactions: Transaction[] = [
    {
      id: 1,
      user_id: 1,
      transaction_type: 'fund',
      amount: 100.0,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      user_id: 1,
      transaction_type: 'withdraw',
      amount: 50.0,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  beforeEach(() => {
    // Created a mock implementation of the Knex instance
    mockKnex = jest.fn(() => ({
      where,
    }));

    transactionModel = new TransactionModel(mockKnex as unknown as Knex);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserTransactions', () => {
    it('should return transactions for a given user_id', async () => {
      const userId = 1;
      where.mockResolvedValueOnce(mockTransactions);

      const transactions = await transactionModel.getUserTransactions(userId);

      expect(mockKnex).toHaveBeenCalledWith('transactions');
      expect(where).toHaveBeenCalledWith({ user_id: userId });
      expect(transactions).toEqual(mockTransactions);
    });

    it('should return an empty array if no transactions found for the user_id', async () => {
      const userId = 999;
      where.mockResolvedValueOnce([]);

      const transactions = await transactionModel.getUserTransactions(userId);

      expect(where).toHaveBeenCalledWith({ user_id: userId });
      expect(transactions).toEqual([]);
    });

    it('should handle database errors', async () => {
      const userId = 1;
      const errorMessage = 'Database error';
      where.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        transactionModel.getUserTransactions(userId),
      ).rejects.toThrow(errorMessage);

      expect(where).toHaveBeenCalledWith({ user_id: userId });
    });
  });
});
