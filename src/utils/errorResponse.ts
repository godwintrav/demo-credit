import { ApiResponse } from '../interfaces/api-response.interface';

export function errorResponse(
  message: string,
  statusCode: number = 400,
): ApiResponse {
  const errorResponse: ApiResponse = { message, statusCode };
  return errorResponse;
}
