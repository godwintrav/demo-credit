import express, { Request, Response } from 'express';
import userRouter from './routes/user.route';
import accountRouter from './routes/account.route';
import transactionRouter from './routes/transaction.route';
import authMiddleware from './middleware/auth.middleware';
import { URL_NOT_FOUND } from './utils/constants';

const app = express();

// Middleware
app.use(express.json());

//routes
app.use('/api/auth', userRouter);
app.use('/api/account', authMiddleware, accountRouter);
app.use('/api/transactions', authMiddleware, transactionRouter);

//unknown url middleware handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: URL_NOT_FOUND });
});

export default app;
