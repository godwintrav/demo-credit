import { BODY_REQUIRED, LOGIN_ERROR } from '../../constants';
import { CreateUserApiResponse } from '../../types/api-response';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { validateRegistration } from './user.validation';

//route handlers for user routes
export class UserController {
  constructor(private readonly userService: UserService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { body } = req;
      //if body is empty return 400 bad request
      if (!body) {
        res.status(400).json({ message: BODY_REQUIRED });
        return;
      }

      //check if data is valid
      const validationResponse: CreateUserApiResponse | null =
        validateRegistration(body);

      //if data is not valid return error response
      if (validationResponse != null && validationResponse.statusCode == 400) {
        res
          .status(validationResponse.statusCode)
          .json({ message: validationResponse.message });
        return;
      }

      console.log('here');

      //call create user from user service
      const apiResponse = await this.userService.createUser(body);

      if (apiResponse.statusCode !== 201) {
        res
          .status(apiResponse.statusCode)
          .json({ message: apiResponse.message });
        return;
      }

      res
        .status(apiResponse.statusCode)
        .json({ user: apiResponse.user, message: apiResponse.message });
      return;
    } catch (e: unknown) {
      const err: Error = e as Error;
      console.error(err);
      res.status(500).json({ message: err.message });
      return;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: LOGIN_ERROR });
        return;
      }

      //call create user from user service
      const apiResponse = await this.userService.loginUser(email, password);

      if (apiResponse.statusCode !== 200) {
        res
          .status(apiResponse.statusCode)
          .json({ message: apiResponse.message });
        return;
      }

      res
        .status(apiResponse.statusCode)
        .json({
          user: apiResponse.user,
          message: apiResponse.message,
          token: apiResponse.token,
        });
      return;
    } catch (e: unknown) {
      const err: Error = e as Error;
      console.error(err);
      res.status(500).json({ message: err.message });
      return;
    }
  }
}
