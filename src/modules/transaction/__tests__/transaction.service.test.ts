import { TransactionService } from '../transaction.service';
import { TransactionModel } from '../transaction.model';
import { SUCCESS_MSG, USER_NOT_FOUND } from '../../../utils/constants';
import { Transaction } from '../../../interfaces/transaction.interface';
import { TransactionsApiResponse } from '../../../interfaces/api-response.interface';
import mockKnex from '../../../__mocks__/knex';
import type { Knex } from 'knex';
import { UserModel } from '../../user/user.model';
import { User } from '../../../interfaces/user.interface';

jest.mock('../transaction.model');
jest.mock('../../user/user.model');

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let mockTransactionModel: jest.Mocked<TransactionModel>;
  let mockUserModel: jest.Mocked<UserModel>;
  const mockUser = {
    name: 'Godwin Odenigbo',
    address: '11 Animat Street',
    email: 'godwintrav@gmail.com',
    city: 'Enugu',
    date_of_birth: '2001-01-12',
    lga_id: '12',
    password: '123456',
  } as unknown as Partial<User> as User;

  beforeEach(() => {
    mockUserModel = new UserModel(
      mockKnex as unknown as Knex,
    ) as jest.Mocked<UserModel>;

    mockTransactionModel = new TransactionModel(
      mockKnex as unknown as Knex,
    ) as jest.Mocked<TransactionModel>;
    transactionService = new TransactionService(
      mockTransactionModel,
      mockUserModel,
    );
  });

  describe('getAllUserTransactions', () => {
    it('should return 404 if no user with user id found', async () => {
      const userId = 1;
      mockUserModel.findUserById.mockResolvedValueOnce(undefined);

      const response: TransactionsApiResponse =
        await transactionService.getAllUserTransactions(userId);

      expect(response.message).toBe(USER_NOT_FOUND);
      expect(response.statusCode).toBe(404);
      expect(mockUserModel.findUserById).toHaveBeenCalledWith(userId);
    });
    it('should return success message and list of transactions for a valid user', async () => {
      mockUserModel.findUserById.mockResolvedValueOnce(mockUser);
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
      expect(mockUserModel.findUserById).toHaveBeenCalledWith(userId);
    });

    it('should return an empty list if the user has no transactions', async () => {
      mockUserModel.findUserById.mockResolvedValueOnce(mockUser);
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
      expect(mockUserModel.findUserById).toHaveBeenCalledWith(userId);
    });

    it('should handle errors thrown by the transaction model gracefully', async () => {
      mockUserModel.findUserById.mockResolvedValueOnce(mockUser);
      const userId = 1;
      const error = new Error('Database error');
      mockTransactionModel.getUserTransactions.mockRejectedValueOnce(error);

      await expect(
        transactionService.getAllUserTransactions(userId),
      ).rejects.toThrow('Database error');
      expect(mockUserModel.findUserById).toHaveBeenCalledWith(userId);
      expect(mockTransactionModel.getUserTransactions).toHaveBeenCalledWith(
        userId,
      );
    });
  });
});
