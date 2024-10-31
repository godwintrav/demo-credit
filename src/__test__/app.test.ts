import request from 'supertest';
import app from '../app';
import { URL_NOT_FOUND } from '../utils/constants';

describe('GET /', () => {
  it('should return URL not found', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(URL_NOT_FOUND);
  });
});
