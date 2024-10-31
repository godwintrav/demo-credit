import express, { Request, Response } from 'express';
import userRouter from './modules/user/user.route';

const app = express();

// Middleware
app.use(express.json());

//routes
app.use('/auth', userRouter);

//UNKNOWN URL MIDDLEWARE HANDLER
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'URL NOT FOUND' });
});

export default app;
