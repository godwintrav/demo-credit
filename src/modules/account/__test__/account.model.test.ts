import { AccountModel } from '../account.model';
import type { Knex } from 'knex';
import { Account } from '../account.interface';

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

  // Mock account data for testing
  const mockAccount: Account = {
    id: 1,
    user_id: 1,
    balance: 100.0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    // Create a mock implementation of the Knex instance
    mockKnex = jest.fn(() => ({
      where,
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

      const account = await accountModel.findAccountById(id);

      expect(mockKnex).toHaveBeenCalledWith('accounts');
      expect(where).toHaveBeenCalledWith({ id });
      expect(account).toEqual(mockAccount);
    });

    it('should return undefined if no account found', async () => {
      const id = 999;
      where().first.mockResolvedValueOnce(undefined);

      const account = await accountModel.findAccountById(id);

      expect(mockKnex().where).toHaveBeenCalledWith({ id });
      expect(where).toHaveBeenCalled();
      expect(where().first).toHaveBeenCalled();
      expect(account).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an account and return the count of updated rows', async () => {
      // Arrange
      const id = 1;
      const accountUpdates = { balance: 200.0 };
      where().update.mockResolvedValueOnce(1); // Simulate successful update

      // Act
      const updatedCount = await accountModel.update(id, accountUpdates);

      // Assert
      expect(mockKnex().where).toHaveBeenCalledWith({ id });
      expect(where().update).toHaveBeenCalledWith(accountUpdates);
      expect(updatedCount).toBe(1);
    });

    it('should throw an error if no account is found to update', async () => {
      // Arrange
      const id = 999; // Non-existent ID
      const accountUpdates = { balance: 200.0 };
      where().update.mockResolvedValueOnce(0); // Simulate no rows updated

      // Act & Assert
      await expect(accountModel.update(id, accountUpdates)).rejects.toThrow(
        'No account found with the provided id',
      );
      expect(where).toHaveBeenCalledWith({ id });
      expect(where().update).toHaveBeenCalledWith(accountUpdates);
    });

    it('should handle database errors during update', async () => {
      // Arrange
      const id = 1;
      const accountUpdates = { balance: 200.0 };
      where().update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(accountModel.update(id, accountUpdates)).rejects.toThrow(
        'Database error',
      );
      expect(where).toHaveBeenCalledWith({ id });
      expect(where().update).toHaveBeenCalledWith(accountUpdates);
    });
  });
});
