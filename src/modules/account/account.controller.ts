import validator from 'validator';
import {
  INVALID_AMOUNT,
  INVALID_USER,
  RECEIVER_ACCOUNT_NOT_FOUND,
} from '../../utils/constants';
import { AccountService } from './account.service';
import { Request, Response } from 'express';
import { AccountApiResponse } from '../../interfaces/api-response.interface';

//controller handlers for account routes
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  async fundAccount(req: Request, res: Response): Promise<void> {
    try {
      let { amount, userId } = req.body;

      if (!amount || Number.isNaN(parseFloat(amount)) || amount <= 0) {
        res.status(400).json({ message: INVALID_AMOUNT });
        return;
      }

      if (!userId || Number.isNaN(parseInt(userId))) {
        res.status(400).json({ message: INVALID_USER });
        return;
      }

      amount = parseFloat(amount);
      userId = parseInt(userId);

      const serviceResponse: AccountApiResponse =
        await this.accountService.fundUserAccountService(userId, amount);
      res.status(serviceResponse.statusCode).json({
        message: serviceResponse.message,
        account: serviceResponse.account,
      });
      return;
    } catch (e: unknown) {
      const err: Error = e as Error;
      //log for debugging
      console.log(err);
      res.status(500).json({ message: err.message });
      return;
    }
  }

  async withdrawAmount(req: Request, res: Response): Promise<void> {
    try {
      let { amount, userId } = req.body;

      if (!amount || Number.isNaN(parseFloat(amount)) || amount <= 0) {
        res.status(400).json({ message: INVALID_AMOUNT });
        return;
      }

      if (!userId || Number.isNaN(parseInt(userId))) {
        res.status(400).json({ message: INVALID_USER });
        return;
      }

      amount = parseFloat(amount);
      userId = parseInt(userId);

      const serviceResponse: AccountApiResponse =
        await this.accountService.withdrawAmountService(userId, amount);
      res.status(serviceResponse.statusCode).json({
        message: serviceResponse.message,
        account: serviceResponse.account,
      });
      return;
    } catch (e: unknown) {
      const err: Error = e as Error;
      //log for debugging
      console.log(err);
      res.status(500).json({ message: err.message });
      return;
    }
  }

  async transferAmount(req: Request, res: Response): Promise<void> {
    try {
      let { amount, senderId, receiverEmail } = req.body;

      if (!amount || Number.isNaN(parseFloat(amount)) || amount <= 0) {
        res.status(400).json({ message: INVALID_AMOUNT });
        return;
      }

      if (!senderId || Number.isNaN(parseInt(senderId))) {
        res.status(400).json({ message: INVALID_USER });
        return;
      }

      if (!receiverEmail || !validator.isEmail(receiverEmail)) {
        res.status(400).json({ message: RECEIVER_ACCOUNT_NOT_FOUND });
        return;
      }

      amount = parseFloat(amount);
      senderId = parseInt(senderId);
      receiverEmail = validator.escape(receiverEmail);

      const serviceResponse: AccountApiResponse =
        await this.accountService.transferAmountService(
          senderId,
          amount,
          receiverEmail,
        );
      res.status(serviceResponse.statusCode).json({
        message: serviceResponse.message,
        account: serviceResponse.account,
      });
      return;
    } catch (e: unknown) {
      const err: Error = e as Error;
      //log for debugging
      console.log(err);
      res.status(500).json({ message: err.message });
      return;
    }
  }

  async getAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || Number.isNaN(parseInt(id))) {
        res.status(400).json({ message: INVALID_USER });
        return;
      }

      const userId = parseInt(id);

      const serviceResponse: AccountApiResponse =
        await this.accountService.getUserAccount(userId);
      res.status(serviceResponse.statusCode).json({
        message: serviceResponse.message,
        account: serviceResponse.account,
        user: serviceResponse.user,
      });
      return;
    } catch (e: unknown) {
      const err: Error = e as Error;
      //log for debugging
      console.log(err);
      res.status(500).json({ message: err.message });
      return;
    }
  }
}
