import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

describe('authMiddleware', () => {
  let validToken: string;
  const invalidToken = 'invalidtoken123';

  beforeAll(() => {
    // Generate a valid JWT for testing purposes
    validToken = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
  });

  it('should allow access if a valid token is provided', async () => {
    const response = await request(app)
      .get('/account/health/test')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Welcome to demo credit test api',
    });
  });

  it('should deny access if no token is provided', async () => {
    const response = await request(app).get('/account/test');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Access denied. No token provided.');
  });

  it('should deny access if an invalid token is provided', async () => {
    const response = await request(app)
      .get('/account/test')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid token.');
  });
});
