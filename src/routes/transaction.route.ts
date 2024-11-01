import { Router } from 'express';
import db from '../config/db';
import { TransactionModel } from '../modules/transaction/transaction.model';
import { TransactionService } from '../modules/transaction/transaction.service';
import { TransactionController } from '../modules/transaction/transaction.controller';
import { UserModel } from '../modules/user/user.model';

const transactionRouter = Router();

//dependency injection
const transactionModel: TransactionModel = new TransactionModel(db!);
const userModel: UserModel = new UserModel(db!);
const transactionService: TransactionService = new TransactionService(
  transactionModel,
  userModel,
);
const transactionController: TransactionController = new TransactionController(
  transactionService,
);

transactionRouter.get('/:userId', (req, res) =>
  transactionController.fetchTransaction(req, res),
);

export default transactionRouter;
