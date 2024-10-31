import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { Request, Response } from 'express';
import { jest } from '@jest/globals';
import * as userValidationModule from '../user.validation';
import {
  BODY_REQUIRED,
  INVALID_EMAIL_ADDRESS,
  LOGIN_ERROR,
  SUCCESS_MSG,
  USER_EXISTS,
} from '../../../constants';
import { User } from '../../../interfaces/user.interface';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const newUser = {
    name: 'Godwin Odenigbo',
    address: 'mock address',
    email: 'godwintrav@gmail.com',
    city: 'Enugu',
    date_of_birth: '2001-01-12',
    lga_id: '12',
  };

  beforeEach(() => {
    mockUserService = {
      createUser: jest.fn(),
      loginUser: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    userController = new UserController(mockUserService);

    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should respond with 400 if body is missing', async () => {
      req.body = undefined;

      await userController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: BODY_REQUIRED });
    });

    it('should respond with 400 if data is invalid', async () => {
      req.body = { email: 'invalid-email', password: '123' };
      const userValidationModuleSpy = jest
        .spyOn(userValidationModule, 'validateRegistration')
        .mockReturnValue({
          statusCode: 400,
          message: INVALID_EMAIL_ADDRESS,
        });

      await userController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: INVALID_EMAIL_ADDRESS });
      userValidationModuleSpy.mockRestore();
    });

    it('should call userService.createUser and return 201 on success', async () => {
      req.body = { ...newUser, password: '123456' };
      mockUserService.createUser.mockResolvedValue({
        statusCode: 201,
        user: newUser as unknown as Partial<User>,
        message: SUCCESS_MSG,
      });

      await userController.register(req as Request, res as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: newUser,
        message: SUCCESS_MSG,
      });
    });

    it('should return correct error status and message if createUser fails', async () => {
      req.body = { ...newUser, password: '123456' };
      mockUserService.createUser.mockResolvedValue({
        statusCode: 400,
        message: USER_EXISTS,
      });

      await userController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: USER_EXISTS });
    });

    it('should return 500 on unexpected error', async () => {
      req.body = { ...newUser, password: '123456' };
      mockUserService.createUser.mockRejectedValue(
        new Error('Internal Server Error'),
      );

      await userController.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });
    });
  });

  describe('login', () => {
    it('should respond with 400 if email or password is missing', async () => {
      req.body = { email: 'test@example.com' };

      await userController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: LOGIN_ERROR });
    });

    it('should call userService.loginUser and return 200 on success', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      mockUserService.loginUser.mockResolvedValue({
        statusCode: 200,
        user: newUser as unknown as Partial<User>,
        message: SUCCESS_MSG,
        token: 'sample-token',
      });

      await userController.login(req as Request, res as Response);

      expect(mockUserService.loginUser).toHaveBeenCalledWith(
        req.body.email,
        req.body.password,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: newUser,
        message: SUCCESS_MSG,
        token: 'sample-token',
      });
    });

    it('should return correct error status and message if loginUser fails', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      mockUserService.loginUser.mockResolvedValue({
        statusCode: 401,
        message: LOGIN_ERROR,
      });

      await userController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: LOGIN_ERROR });
    });

    it('should return 500 on unexpected error', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      mockUserService.loginUser.mockRejectedValue(
        new Error('Internal Server Error'),
      );

      await userController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });
    });
  });
});
