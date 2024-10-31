import { CreateUserApiResponse } from '../types/api-response';

export function errorResponse(
  message: string,
  statusCode: number = 400,
): CreateUserApiResponse {
  const errorResponse: CreateUserApiResponse = { message, statusCode };
  return errorResponse;
}
