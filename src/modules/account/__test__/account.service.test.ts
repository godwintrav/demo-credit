import { AccountService } from '../account.service';
import { AccountModel } from '../account.model';
import {
  ACCOUNT_NOT_FOUND,
  INSUFFICIENT_FUNDS,
  RECEIVER_ACCOUNT_NOT_FOUND,
  SUCCESS_MSG,
} from '../../../constants';
import { Account } from '../../../interfaces/account.interface';
import { UserAccount } from '../../../interfaces/user-account.interface';
import mockKnex from '../../../__mocks__/knex';
import type { Knex } from 'knex';
import { AccountApiResponse } from '../../../interfaces/api-response.interface';

jest.mock('../account.model');

describe('AccountService', () => {
  let accountService: AccountService;
  let mockAccountModel: jest.Mocked<AccountModel>;

  beforeEach(() => {
    mockAccountModel = new AccountModel(
      mockKnex as unknown as Knex,
    ) as jest.Mocked<AccountModel>;
    accountService = new AccountService(mockAccountModel);
  });

  describe('fundUserAccountService', () => {
    it('should return an error if account does not exist', async () => {
      mockAccountModel.findAccountByUserId.mockResolvedValueOnce(undefined);

      const response: AccountApiResponse =
        await accountService.fundUserAccountService(1, 100);

      expect(response).toEqual({ message: ACCOUNT_NOT_FOUND, statusCode: 404 });
      expect(mockAccountModel.findAccountByUserId).toHaveBeenCalledWith(1);
    });

    it('should add funds to account and return success message', async () => {
      const account: Account = { id: 1, user_id: 1, balance: 200 };
      mockAccountModel.findAccountByUserId.mockResolvedValueOnce(account);
      mockAccountModel.updateAccount.mockResolvedValueOnce(1);

      const response: AccountApiResponse =
        await accountService.fundUserAccountService(1, 100);

      expect(response.message).toBe(SUCCESS_MSG);
      expect(response.account?.balance).toBe(300);
      expect(response.statusCode).toBe(200);
      expect(mockAccountModel.createTransaction).toHaveBeenCalled();
      expect(mockAccountModel.createTransaction).toHaveBeenCalledWith({
        user_id: account.user_id,
        transaction_type: 'fund',
        amount: 100,
      });
    });
  });

  describe('withdrawAmountService', () => {
    it('should return an error if account does not exist', async () => {
      mockAccountModel.findAccountByUserId.mockResolvedValueOnce(undefined);

      const response: AccountApiResponse =
        await accountService.withdrawAmountService(1, 100);

      expect(response).toEqual({ message: ACCOUNT_NOT_FOUND, statusCode: 404 });
    });

    it('should return an error if insufficient funds', async () => {
      const account: Account = { id: 1, user_id: 1, balance: 50 };
      mockAccountModel.findAccountByUserId.mockResolvedValueOnce(account);

      const response: AccountApiResponse =
        await accountService.withdrawAmountService(1, 100);

      expect(response).toEqual({
        message: INSUFFICIENT_FUNDS,
        statusCode: 402,
      });
    });

    it('should withdraw funds from account and return success message', async () => {
      const account: Account = { id: 1, user_id: 1, balance: 200 };
      mockAccountModel.findAccountByUserId.mockResolvedValueOnce(account);
      mockAccountModel.updateAccount.mockResolvedValueOnce(1);

      const response: AccountApiResponse =
        await accountService.withdrawAmountService(1, 100);

      expect(response.message).toBe(SUCCESS_MSG);
      expect(response.account?.balance).toBe(100);
      expect(response.statusCode).toBe(200);
      expect(mockAccountModel.createTransaction).toHaveBeenCalled();
      expect(mockAccountModel.createTransaction).toHaveBeenCalledWith({
        user_id: account.user_id,
        transaction_type: 'withdraw',
        amount: 100,
      });
    });
  });

  describe('transferAmountService', () => {
    it('should return an error if sender account does not exist', async () => {
      mockAccountModel.findAccountByUserId.mockResolvedValueOnce(undefined);

      const response: AccountApiResponse =
        await accountService.transferAmountService(
          1,
          100,
          'receiver@example.com',
        );

      expect(response).toEqual({ message: ACCOUNT_NOT_FOUND, statusCode: 404 });
    });

    it('should return an error if sender has insufficient funds', async () => {
      const senderAccount: Account = { id: 1, user_id: 1, balance: 50 };
      mockAccountModel.findAccountByUserId.mockResolvedValueOnce(senderAccount);

      const response: AccountApiResponse =
        await accountService.transferAmountService(
          1,
          100,
          'receiver@example.com',
        );

      expect(response).toEqual({
        message: INSUFFICIENT_FUNDS,
        statusCode: 402,
      });
    });

    it('should return an error if receiver account does not exist', async () => {
      const senderAccount: Account = { id: 1, user_id: 1, balance: 200 };
      mockAccountModel.findAccountByUserId.mockResolvedValueOnce(senderAccount);
      mockAccountModel.findAccountByEmail.mockResolvedValueOnce(undefined);

      const response: AccountApiResponse =
        await accountService.transferAmountService(
          1,
          100,
          'receiver@example.com',
        );

      expect(response).toEqual({
        message: RECEIVER_ACCOUNT_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('should transfer funds between accounts and return success message', async () => {
      const senderAccount: Account = { id: 1, user_id: 1, balance: 200 };
      const receiverAccount: Account = { id: 2, user_id: 2, balance: 100 };
      mockAccountModel.findAccountByUserId.mockResolvedValueOnce(senderAccount);
      mockAccountModel.findAccountByEmail.mockResolvedValueOnce(
        receiverAccount,
      );
      mockAccountModel.updateTransfer.mockResolvedValueOnce(1);

      const response: AccountApiResponse =
        await accountService.transferAmountService(
          1,
          100,
          'receiver@example.com',
        );

      expect(response.message).toBe(SUCCESS_MSG);
      expect(response.account?.balance).toBe(100);
      expect(response.statusCode).toBe(200);
      expect(mockAccountModel.updateTransfer).toHaveBeenCalled();
      expect(mockAccountModel.createTransaction).toHaveBeenCalledTimes(2);
      expect(mockAccountModel.createTransaction).toHaveBeenCalledWith({
        user_id: senderAccount.user_id,
        transaction_type: 'transferOut',
        amount: 100,
      });
      expect(mockAccountModel.createTransaction).toHaveBeenCalledWith({
        user_id: receiverAccount.user_id,
        transaction_type: 'transferIn',
        amount: 100,
      });
    });
  });

  describe('getUserAccount', () => {
    it('should return an error if user account does not exist', async () => {
      mockAccountModel.findUserAndAccountById.mockResolvedValueOnce(undefined);

      const response: AccountApiResponse =
        await accountService.getUserAccount(1);

      expect(response).toEqual({ message: ACCOUNT_NOT_FOUND, statusCode: 404 });
    });

    it('should return user account and user data on success', async () => {
      const userAccount: UserAccount = {
        id: 1,
        user_id: 1,
        balance: 500,
        email: 'test@example.com',
        name: 'Test User',
        address: '123 Test St',
        city: 'Test City',
        date_of_birth: new Date('1990-01-01'),
        lga_id: 1,
      };
      mockAccountModel.findUserAndAccountById.mockResolvedValueOnce(
        userAccount,
      );

      const response: AccountApiResponse =
        await accountService.getUserAccount(1);

      expect(response.message).toBe(SUCCESS_MSG);
      expect(response.statusCode).toBe(200);
      expect(response.account?.balance).toBe(500);
      expect(response.user?.email).toBe('test@example.com');
    });
  });
});
