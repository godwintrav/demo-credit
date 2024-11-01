import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthRequest } from '../interfaces/auth-request.interface';

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const { userId, email } = decoded as JwtPayload;
    req.userId = userId;
    req.userEmail = email;
    next(); // Pass control to the next middleware
  } catch (err: unknown) {
    const error: Error = err as Error;
    //log for debugging
    console.log(error.message);
    res.status(401).json({ message: 'Invalid token.' });
    return;
  }
};

export default authMiddleware;
