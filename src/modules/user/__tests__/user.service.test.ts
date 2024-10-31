import { UserService } from '../user.service';
import { UserModel } from '../user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../../../utils/errorResponse';
import { LOGIN_ERROR, SUCCESS_MSG, USER_EXISTS } from '../../../constants';
import { User } from '../../../interfaces/user.interface';
import mockKnex from '../../../__mocks__/knex';
import type { Knex } from 'knex';

jest.mock('../user.model');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../utils/errorResponse');
jest.mock('knex');

describe('UserService', () => {
  let userService: UserService;
  let mockUserModel: jest.Mocked<UserModel>;
  const newMockUser = {
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
    userService = new UserService(mockUserModel);
  });

  describe('createUser', () => {
    it('should return an error if user already exists', async () => {
      mockUserModel.findUserByEmail.mockResolvedValue({
        email: 'existing@example.com',
      } as User);

      const response = await userService.createUser({
        email: 'existing@example.com',
        password: 'password123',
        name: 'John Doe',
        address: '123 Street',
        city: 'Lagos',
        date_of_birth: '1990-01-01',
        lga_id: 1,
      });

      expect(response).toEqual(errorResponse(USER_EXISTS));
      expect(mockUserModel.findUserByEmail).toHaveBeenCalledWith(
        'existing@example.com',
      );
    });

    it('should create a new user and return user data on success', async () => {
      const newUserId = 1;
      mockUserModel.findUserByEmail.mockResolvedValueOnce(undefined); // No existing user
      mockUserModel.insert.mockResolvedValueOnce(newUserId);
      mockUserModel.findUserByEmail.mockResolvedValueOnce(newMockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      const response = await userService.createUser(newMockUser);

      expect(response.statusCode).toBe(201);
      expect(response.user?.email).toBe(newMockUser.email);
      expect(response.message).toBe(SUCCESS_MSG);
      expect(mockUserModel.insert).toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should return an error if user does not exist', async () => {
      mockUserModel.findUserByEmail.mockResolvedValueOnce(undefined);

      const response = await userService.loginUser(
        'nonexistent@example.com',
        'password123',
      );

      expect(response).toEqual(errorResponse(LOGIN_ERROR, 401));
    });

    it('should return an error if password is incorrect', async () => {
      mockUserModel.findUserByEmail.mockResolvedValueOnce({
        email: 'existing@example.com',
        password: 'hashedPassword123',
      } as User);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const response = await userService.loginUser(
        'existing@example.com',
        'wrongpassword',
      );
      expect(response).toEqual(errorResponse(LOGIN_ERROR, 401));
    });

    it('should return a JWT token and user data on successful login', async () => {
      const user = {
        id: 1,
        email: 'existing@example.com',
        password: 'hashedPassword123',
      } as User;
      mockUserModel.findUserByEmail.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken123');

      const response = await userService.loginUser(
        'existing@example.com',
        'password123',
      );

      expect(response.statusCode).toBe(200);
      expect(response.user?.email).toBe('existing@example.com');
      expect(response.token).toBe('mockToken123');
      expect(response.message).toBe(SUCCESS_MSG);
    });
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValueOnce('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword123');

      const hashedPassword = await userService.hashPassword('password123');

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(hashedPassword).toBe('hashedPassword123');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await userService.verifyPassword(
        'password123',
        'hashedPassword123',
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
    });

    it('should return false for incorrect password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await userService.verifyPassword(
        'password123',
        'wrongHashedPassword',
      );

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'wrongHashedPassword',
      );
    });
  });

  describe('generateJWTToken', () => {
    it('should generate a JWT token', async () => {
      (jwt.sign as jest.Mock).mockReturnValue('mockToken123');
      process.env.JWT_SECRET = 'test_secret';

      const token = await userService.generateJWTToken('test@example.com', 1);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, email: 'test@example.com' },
        'test_secret',
        { expiresIn: '1h' },
      );
      expect(token).toBe('mockToken123');
    });
  });
});
