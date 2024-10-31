/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '../../interfaces/user.interface';
import bcrypt from 'bcrypt';
import { UserModel } from './user.model';
import {
  CreateUserApiResponse,
  LoginUserApiResponse,
} from '../../interfaces/api-response.interface';
import validator from 'validator';
import { errorResponse } from '../../utils/errorResponse';
import { LOGIN_ERROR, SUCCESS_MSG, USER_EXISTS } from '../../constants';
import jwt from 'jsonwebtoken';

//This class handles business logic for users
export class UserService {
  constructor(private readonly userModel: UserModel) {}

  //create a new user
  async createUser(body: any): Promise<CreateUserApiResponse> {
    const hashedPassword = await this.hashPassword(body.password);

    //create new user object without id
    const user: Omit<User, 'id'> = {
      address: validator.escape(body.address.trim()),
      city: validator.escape(body.city.trim()),
      date_of_birth: new Date(body.date_of_birth),
      email: body.email.trim(),
      lga_id: body.lga_id,
      name: validator.escape(body.name.trim()),
      password: hashedPassword,
    };

    const existingUser = await this.userModel.findUserByEmail(user.email);

    if (existingUser != null) {
      return errorResponse(USER_EXISTS);
    }

    await this.userModel.insert(user);
    const newUser = await this.userModel.findUserByEmail(user.email);
    delete newUser!.password;
    return { statusCode: 201, user: newUser, message: 'success' };
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<LoginUserApiResponse> {
    const existingUser = await this.userModel.findUserByEmail(
      validator.escape(email.trim()),
    );

    if (existingUser == null) {
      return errorResponse(LOGIN_ERROR, 401);
    }

    const isPasswordMatch = await this.verifyPassword(
      password,
      existingUser.password!,
    );
    if (!isPasswordMatch) {
      return errorResponse(LOGIN_ERROR, 401);
    }

    const token = await this.generateJWTToken(
      existingUser.email,
      existingUser.id,
    );
    delete existingUser.password;
    const response: LoginUserApiResponse = {
      message: SUCCESS_MSG,
      statusCode: 200,
      token,
      user: existingUser,
    };
    return response;
  }

  // Function to hash a password
  async hashPassword(password: string): Promise<string> {
    const SALT_ROUNDS = 10;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  // Function to verify a password against a hashed password
  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }

  async generateJWTToken(email: string, userId: number) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }, // Token expiry time
    );
  }
}
