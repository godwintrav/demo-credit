import { AccountModel } from '../account.model';
import type { Knex } from 'knex';
import { Account } from '../../../interfaces/account.interface';
import { UserAccount } from '../../../interfaces/user-account.interface';
import { Transaction } from '../../../interfaces/transaction.interface';

jest.mock('knex');

describe('AccountModel', () => {
  let accountModel: AccountModel;
  let mockKnex: jest.Mock;
  const update = jest.fn();
  const first = jest.fn();
  const where = jest.fn(() => ({
    first,
    update,
  }));
  const innerJoin = jest.fn(() => ({
    where,
  }));
  const select = jest.fn(() => ({
    innerJoin,
  }));
  const insert = jest.fn();

  // Mock account data for testing
  const mockAccount: Account = {
    id: 1,
    user_id: 1,
    balance: 100.0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Mock user account data for testing
  const mockUserAndAccount: Partial<UserAccount> = {
    id: 1,
    user_id: 1,
    balance: 100.0,
    address: 'address',
    name: 'john doe',
  };

  beforeEach(() => {
    // Created a mock implementation of the Knex instance
    mockKnex = jest.fn(() => ({
      where,
      select,
      insert,
    }));

    accountModel = new AccountModel(mockKnex as unknown as Knex);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAccountById', () => {
    it('should return an account by ID', async () => {
      const id = 1;
      where().first.mockResolvedValueOnce(mockAccount);

      const account: Account | undefined =
        await accountModel.findAccountById(id);

      expect(mockKnex).toHaveBeenCalledWith('accounts');
      expect(where).toHaveBeenCalledWith({ user_id: id });
      expect(account).toEqual(mockAccount);
    });

    it('should return undefined if no account found', async () => {
      const id = 999;
      where().first.mockResolvedValueOnce(undefined);

      const account: Account | undefined =
        await accountModel.findAccountById(id);

      expect(where).toHaveBeenCalledWith({ user_id: id });
      expect(where).toHaveBeenCalled();
      expect(where().first).toHaveBeenCalled();
      expect(account).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an account and return the count of updated rows', async () => {
      const id = 1;
      const accountUpdates = { balance: 200.0 };
      where().update.mockResolvedValueOnce(1);

      const updatedCount: number = await accountModel.updateAccount(
        id,
        accountUpdates,
      );

      expect(mockKnex().where).toHaveBeenCalledWith({ id });
      expect(where().update).toHaveBeenCalledWith({
        balance: accountUpdates.balance,
      });
      expect(updatedCount).toBe(1);
    });

    it('should throw an error if no account is found to update', async () => {
      const id = 999;
      const accountUpdates = { balance: 200.0 };
      where().update.mockResolvedValueOnce(0);

      await expect(
        accountModel.updateAccount(id, accountUpdates),
      ).rejects.toThrow('No account found with the provided id');
      expect(where).toHaveBeenCalledWith({ id });
      expect(where().update).toHaveBeenCalledWith(accountUpdates);
    });

    it('should handle database errors during update', async () => {
      const id = 1;
      const accountUpdates = { balance: 200.0 };
      where().update.mockRejectedValue(new Error('Database error'));

      await expect(
        accountModel.updateAccount(id, accountUpdates),
      ).rejects.toThrow('Database error');
      expect(where).toHaveBeenCalledWith({ id });
      expect(where().update).toHaveBeenCalledWith(accountUpdates);
    });
  });

  describe('findAccountByEmail', () => {
    it('should return an account by email', async () => {
      const email = 'test@email.com';

      select().innerJoin().where().first.mockResolvedValueOnce(mockAccount);

      const account = await accountModel.findAccountByEmail(email);

      expect(mockKnex).toHaveBeenCalledWith('accounts');
      expect(where).toHaveBeenCalledWith('users.email', email);
      expect(select).toHaveBeenCalled();
      expect(where().first).toHaveBeenCalled();
      expect(account).toEqual(mockAccount);
    });

    it('should return undefined if no account found', async () => {
      const email = 'john.doe@email.com';
      select().innerJoin().where().first.mockResolvedValueOnce(undefined);

      const account = await accountModel.findAccountByEmail(email);

      expect(where).toHaveBeenCalledWith('users.email', email);
      expect(where).toHaveBeenCalled();
      expect(where().first).toHaveBeenCalled();
      expect(select).toHaveBeenCalled();
      expect(account).toBeUndefined();
    });
  });

  describe('findUserAndAccountById', () => {
    it('should user info and account info by id', async () => {
      const id = 1;

      select()
        .innerJoin()
        .where()
        .first.mockResolvedValueOnce(mockUserAndAccount);

      const account = await accountModel.findUserAndAccountById(id);

      expect(mockKnex).toHaveBeenCalledWith('accounts');
      expect(where).toHaveBeenCalledWith('users.id', id);
      expect(select).toHaveBeenCalled();
      expect(where().first).toHaveBeenCalled();
      expect(account).toEqual(mockUserAndAccount);
    });

    it('should return undefined if no account found', async () => {
      const id = 999;
      select().innerJoin().where().first.mockResolvedValueOnce(undefined);

      const account: UserAccount | undefined =
        await accountModel.findUserAndAccountById(id);

      expect(where).toHaveBeenCalledWith('users.id', id);
      expect(where).toHaveBeenCalled();
      expect(where().first).toHaveBeenCalled();
      expect(select).toHaveBeenCalled();
      expect(account).toBeUndefined();
    });
  });

  describe('createTransaction', () => {
    // Mock transaction data for testing
    const mockTransaction: Omit<Transaction, 'id'> = {
      user_id: 1,
      transaction_type: 'fund',
      amount: 50.0,
      reference: 'TXN123',
      created_at: new Date(),
      updated_at: new Date(),
    };
    it('should insert a transaction into the transactions table', async () => {
      insert.mockResolvedValueOnce([1]); // Mock insert response with an array of inserted IDs

      await accountModel.createTransaction(mockTransaction);

      expect(mockKnex).toHaveBeenCalledWith('transactions');
      expect(insert).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle database errors during insertion', async () => {
      const errorMessage = 'Database error';
      insert.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        accountModel.createTransaction(mockTransaction),
      ).rejects.toThrow(errorMessage);

      expect(insert).toHaveBeenCalledWith(mockTransaction);
    });
  });
});
