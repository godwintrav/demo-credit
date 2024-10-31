import { TransactionController } from '../transaction.controller';
import { TransactionService } from '../transaction.service';
import { Request, Response } from 'express';
import { INVALID_USER } from '../../../utils/constants';
import { TransactionsApiResponse } from '../../../interfaces/api-response.interface';

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let mockTransactionService: jest.Mocked<TransactionService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockTransactionService = {
      getAllUserTransactions: jest.fn(),
    } as unknown as jest.Mocked<TransactionService>;

    transactionController = new TransactionController(mockTransactionService);

    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTransaction', () => {
    it('should respond with 400 if userId is invalid', async () => {
      req.params = { userId: 'invalid' }; // invalid userId

      await transactionController.fetchTransaction(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: INVALID_USER });
    });

    it('should call getAllUserTransactions and return 200 on success', async () => {
      req.params = { userId: '1' }; // valid userId
      const serviceResponse: TransactionsApiResponse = {
        statusCode: 200,
        transactions: [],
        message: 'Transactions retrieved successfully',
      };

      mockTransactionService.getAllUserTransactions.mockResolvedValue(
        serviceResponse,
      );

      await transactionController.fetchTransaction(
        req as Request,
        res as Response,
      );

      expect(
        mockTransactionService.getAllUserTransactions,
      ).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(serviceResponse.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        transactions: serviceResponse.transactions,
        message: serviceResponse.message,
      });
    });

    it('should return 500 on unexpected error', async () => {
      req.params = { userId: '1' };
      mockTransactionService.getAllUserTransactions.mockRejectedValue(
        new Error('Internal Error'),
      );

      await transactionController.fetchTransaction(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Error' });
    });
  });
});
