import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
  userId?: number;
  email?: string;
}

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
    // Replace 'mysecretkey' with `process.env.JWT_SECRET` for production
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const { userId, email } = decoded as JwtPayload;
    req.userId = userId;
    req.email = email;
    next(); // Pass control to the next middleware
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token.' });
    return;
  }
};

export default authMiddleware;
