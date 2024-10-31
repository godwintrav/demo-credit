import { Router } from 'express';
import { AccountModel } from './account.model';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import db from '../../config/db';

const accountRouter = Router();

//dependency injection
const accountModel: AccountModel = new AccountModel(db);
const userService: AccountService = new AccountService(accountModel);
const accountController: AccountController = new AccountController(userService);

accountRouter.post('/fund', (req, res) =>
  accountController.fundAccount(req, res),
);
accountRouter.post('/withdraw', (req, res) =>
  accountController.withdrawAmount(req, res),
);
accountRouter.post('/transfer', (req, res) =>
  accountController.transferAmount(req, res),
);
accountRouter.get('/:id', (req, res) => accountController.getAccount(req, res));
accountRouter.get('/health/test', (req, res) => {
  res.status(200).json({ message: 'Welcome to demo credit test api' });
  return;
});

export default accountRouter;
