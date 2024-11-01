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
import {
  BLACKLISTED_ERROR_MSG,
  LOGIN_ERROR,
  SUCCESS_MSG,
  USER_EXISTS,
} from '../../utils/constants';
import jwt from 'jsonwebtoken';
import axios from 'axios';

//This class handles business logic for users
export class UserService {
  constructor(private readonly userModel: UserModel) {}

  //create a new user
  async createUser(body: any): Promise<CreateUserApiResponse> {
    const isBlacklisted = await this.checkKarmaBlacklist(body.email);
    if (isBlacklisted === true) {
      return errorResponse(BLACKLISTED_ERROR_MSG);
    }

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

    const existingUser: User | undefined = await this.userModel.findUserByEmail(
      user.email,
    );

    if (existingUser != null) {
      return errorResponse(USER_EXISTS);
    }

    await this.userModel.insert(user);
    const newUser: User | undefined = await this.userModel.findUserByEmail(
      user.email,
    );
    delete newUser!.password;
    return { statusCode: 201, user: newUser, message: 'success' };
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<LoginUserApiResponse> {
    const existingUser: User | undefined = await this.userModel.findUserByEmail(
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

    const token: string = await this.generateJWTToken(
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
    const salt: string = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword: string = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  // Function to verify a password against a hashed password
  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch: boolean = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }

  async generateJWTToken(email: string, userId: number) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }, // Token expiry time
    );
  }

  //function to check karma api if user is in blacklist
  async checkKarmaBlacklist(email: string): Promise<boolean> {
    try {
      const URL = `https://adjutor.lendsqr.com/v2/verification/karma/${email}`;
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${process.env.KARMA_API_KEY}`,
        },
      });
      if (response.status == 404) {
        return false;
      } else {
        return true;
      }
    } catch (error: unknown) {
      //throw error with more descriptive error message and log for debugging
      console.log(error);
      throw new Error(`Error fetching Karma Blacklist data`);
    }
  }
}
