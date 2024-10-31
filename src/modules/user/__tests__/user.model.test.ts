import { UserModel } from '../user.model';
import type { Knex } from 'knex';
import { User } from '../../../interfaces/user.interface';

describe('UserModel', () => {
  let userModel: UserModel;
  const mockUser = {
    name: 'Godwin Odenigbo',
    address: '11 Animat Street',
    email: 'godwintrav@gmail.com',
    city: 'Enugu',
    date_of_birth: '2001-01-12',
    lga_id: '12',
    password: '123456',
  } as unknown as Omit<User, 'id'>;

  const insert = jest.fn();
  const first = jest.fn();
  const where = jest.fn().mockReturnThis();
  const transaction = jest.fn();

  let mockKnex: jest.Mock;

  beforeEach(() => {
    mockKnex = jest.fn(() => ({
      insert,
      where,
      first,
    }));

    userModel = new UserModel(mockKnex as unknown as Knex);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert', () => {
    let insertKnexMock: unknown;
    beforeEach(() => {
      // Mock the knex instance to include the transaction method
      insertKnexMock = {
        transaction,
      };

      userModel = new UserModel(insertKnexMock as unknown as Knex);
    });

    it('should insert a new user and return the user id', async () => {
      transaction.mockResolvedValueOnce(1);
      const newUserId: number = await userModel.insert(mockUser);

      expect(newUserId).toBe(1);
    });

    it('should handle database errors during user insert', async () => {
      transaction.mockRejectedValueOnce(new Error('Database insert error'));

      await expect(userModel.insert(mockUser)).rejects.toThrow(
        'Transaction failed: Database insert error',
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      first.mockResolvedValueOnce(mockUser);

      const user: User | undefined = await userModel.findUserByEmail(
        mockUser.email,
      );

      expect(where).toHaveBeenCalledWith({ email: mockUser.email });
      expect(first).toHaveBeenCalled();
      expect(user).toEqual(mockUser);
    });

    it('should return undefined if no user found by email', async () => {
      first.mockResolvedValueOnce(undefined);

      const user: User | undefined = await userModel.findUserByEmail(
        'nonexistent@example.com',
      );

      expect(where).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(first).toHaveBeenCalled();
      expect(user).toBeUndefined();
    });

    it('should handle database errors during findUserByEmail', async () => {
      first.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        userModel.findUserByEmail('error@example.com'),
      ).rejects.toThrow('Database error');
      expect(where).toHaveBeenCalledWith({ email: 'error@example.com' });
    });
  });

  describe('findUserById', () => {
    it('should return a user by id', async () => {
      first.mockResolvedValueOnce(mockUser);

      const user: User | undefined = await userModel.findUserById(1);

      expect(where).toHaveBeenCalledWith({ id: 1 });
      expect(first).toHaveBeenCalled();
      expect(user).toEqual(mockUser);
    });

    it('should return undefined if no user found by id', async () => {
      first.mockResolvedValueOnce(undefined);

      const user: User | undefined = await userModel.findUserById(999);

      expect(where).toHaveBeenCalledWith({ id: 999 });
      expect(first).toHaveBeenCalled();
      expect(user).toBeUndefined();
    });

    it('should handle database errors during findUserById', async () => {
      first.mockRejectedValueOnce(new Error('Database error'));

      await expect(userModel.findUserById(1)).rejects.toThrow('Database error');
      expect(where).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
