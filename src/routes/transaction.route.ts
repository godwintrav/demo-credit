import { Router } from 'express';
import db from '../config/db';
import { TransactionModel } from '../modules/transaction/transaction.model';
import { TransactionService } from '../modules/transaction/transaction.service';
import { TransactionController } from '../modules/transaction/transaction.controller';

const transactionRouter = Router();

//dependency injection
const transactionModel: TransactionModel = new TransactionModel(db);
const transactionService: TransactionService = new TransactionService(
  transactionModel,
);
const transactionController: TransactionController = new TransactionController(
  transactionService,
);

transactionRouter.get('/:userId', (req, res) =>
  transactionController.fetchTransaction(req, res),
);

export default transactionRouter;
