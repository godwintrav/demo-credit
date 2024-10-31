import { AccountController } from '../account.controller';
import { AccountService } from '../account.service';
import { Request, Response } from 'express';
import { jest } from '@jest/globals';
import { INVALID_AMOUNT, INVALID_USER } from '../../../constants';
import { AccountApiResponse } from '../../../interfaces/api-response.interface';

describe('AccountController', () => {
  let accountController: AccountController;
  let mockAccountService: jest.Mocked<AccountService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockAccountService = {
      fundUserAccountService: jest.fn(),
      withdrawAmountService: jest.fn(),
      transferAmountService: jest.fn(),
      getUserAccount: jest.fn(),
    } as unknown as jest.Mocked<AccountService>;

    accountController = new AccountController(mockAccountService);

    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fundAccount', () => {
    it('should respond with 400 if amount or userId is invalid', async () => {
      req.body = { amount: -10, userId: 'abc' };

      await accountController.fundAccount(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: INVALID_AMOUNT });
    });

    it('should call fundUserAccountService and return 200 on success', async () => {
      req.body = { amount: 100, userId: 1 };
      const serviceResponse = {
        statusCode: 200,
        account: {},
        message: 'Funded',
      };
      mockAccountService.fundUserAccountService.mockResolvedValue(
        serviceResponse,
      );
      const { statusCode, ...jsonResponse } = serviceResponse;
      await accountController.fundAccount(req as Request, res as Response);

      expect(mockAccountService.fundUserAccountService).toHaveBeenCalledWith(
        1,
        100,
      );
      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith(jsonResponse);
    });

    it('should return 500 on unexpected error', async () => {
      req.body = { amount: 100, userId: 1 };
      mockAccountService.fundUserAccountService.mockRejectedValue(
        new Error('Internal Error'),
      );

      await accountController.fundAccount(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Error' });
    });
  });

  describe('withdrawAmount', () => {
    it('should respond with 400 if amount or userId is invalid', async () => {
      req.body = { amount: 'abc', userId: -5 };

      await accountController.withdrawAmount(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: INVALID_AMOUNT });
    });

    it('should call withdrawAmountService and return 200 on success', async () => {
      req.body = { amount: 50, userId: 1 };
      const serviceResponse = {
        statusCode: 200,
        account: {},
        message: 'Withdrawn',
      };
      mockAccountService.withdrawAmountService.mockResolvedValue(
        serviceResponse,
      );
      const { statusCode, ...jsonResponse } = serviceResponse;

      await accountController.withdrawAmount(req as Request, res as Response);

      expect(mockAccountService.withdrawAmountService).toHaveBeenCalledWith(
        1,
        50,
      );
      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith(jsonResponse);
    });

    it('should return 500 on unexpected error', async () => {
      req.body = { amount: 50, userId: 1 };
      mockAccountService.withdrawAmountService.mockRejectedValue(
        new Error('Internal Error'),
      );

      await accountController.withdrawAmount(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Error' });
    });
  });

  describe('transferAmount', () => {
    it('should respond with 400 if amount, senderId, or receiverEmail is invalid', async () => {
      req.body = { amount: 'abc', senderId: 1, receiverEmail: 'invalid-email' };

      await accountController.transferAmount(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: INVALID_AMOUNT });
    });

    it('should call transferAmountService and return 200 on success', async () => {
      req.body = {
        amount: 100,
        senderId: 1,
        receiverEmail: 'receiver@example.com',
      };
      const serviceResponse = {
        statusCode: 200,
        account: {},
        message: 'Transferred',
      };
      mockAccountService.transferAmountService.mockResolvedValue(
        serviceResponse,
      );
      const { statusCode, ...jsonResponse } = serviceResponse;

      await accountController.transferAmount(req as Request, res as Response);

      expect(mockAccountService.transferAmountService).toHaveBeenCalledWith(
        1,
        100,
        'receiver@example.com',
      );
      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith(jsonResponse);
    });

    it('should return 500 on unexpected error', async () => {
      req.body = {
        amount: 100,
        senderId: 1,
        receiverEmail: 'receiver@example.com',
      };
      mockAccountService.transferAmountService.mockRejectedValue(
        new Error('Internal Error'),
      );

      await accountController.transferAmount(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Error' });
    });
  });

  describe('getAccount', () => {
    it('should respond with 400 if userId is invalid', async () => {
      req.params = { id: 'abc' };

      await accountController.getAccount(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: INVALID_USER });
    });

    it('should call getUserAccount and return 200 on success', async () => {
      req.params = { id: '1' };
      const serviceResponse: AccountApiResponse = {
        statusCode: 200,
        account: {},
        message: 'Account found',
        user: {},
      };

      const { statusCode, ...jsonResponse } = serviceResponse;

      mockAccountService.getUserAccount.mockResolvedValue(serviceResponse);

      await accountController.getAccount(req as Request, res as Response);

      expect(mockAccountService.getUserAccount).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith(jsonResponse);
    });

    it('should return 500 on unexpected error', async () => {
      req.params = { id: '1' };
      mockAccountService.getUserAccount.mockRejectedValue(
        new Error('Internal Error'),
      );

      await accountController.getAccount(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Error' });
    });
  });
});
