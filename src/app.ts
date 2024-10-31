import express, { Request, Response } from 'express';
import userRouter from './modules/user/user.route';
import accountRouter from './modules/account/account.route';

const app = express();

// Middleware
app.use(express.json());

//routes
app.use('/auth', userRouter);
app.use('/account', accountRouter);

//unknown url middleware handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'URL NOT FOUND' });
});

export default app;
