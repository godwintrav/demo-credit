import express, { Request, Response } from 'express';
import userRouter from './modules/user/user.route';
import accountRouter from './modules/account/account.route';
import transactionRouter from './modules/transaction/transaction.route';
import authMiddleware from './middleware/auth.middleware';
import { URL_NOT_FOUND } from './constants';

const app = express();

// Middleware
app.use(express.json());

//routes
app.use('/auth', userRouter);
app.use('/account', authMiddleware, accountRouter);
app.use('/transactions', authMiddleware, transactionRouter);

//unknown url middleware handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: URL_NOT_FOUND });
});

export default app;
