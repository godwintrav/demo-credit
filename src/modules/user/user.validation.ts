/* eslint-disable @typescript-eslint/no-explicit-any */
import validator from 'validator';
import {
  ADDRESS_REQUIRED,
  CITY_REQUIRED,
  INVALID_DOB,
  INVALID_EMAIL_ADDRESS,
  INVALID_NAME,
  INVALID_PASSWORD,
  LGA_REQUIRED,
} from '../../constants';
import { CreateUserApiResponse } from '../../interfaces/api-response.interface';
import { errorResponse } from '../../utils/errorResponse';

export function validateRegistration(body: any): CreateUserApiResponse | null {
  if (!body.address) {
    return errorResponse(ADDRESS_REQUIRED);
  }

  if (!body.name) {
    return errorResponse(INVALID_NAME);
  }

  if (!body.email || !validator.isEmail(body.email)) {
    return errorResponse(INVALID_EMAIL_ADDRESS);
  }

  if (!body.city) {
    return errorResponse(CITY_REQUIRED);
  }

  if (!body.date_of_birth || !validator.isDate(body.date_of_birth)) {
    return errorResponse(INVALID_DOB);
  }

  if (!body.lga_id || !validator.isNumeric(body.lga_id)) {
    return errorResponse(LGA_REQUIRED);
  }

  if (!body.password || body.password.length < 6) {
    return errorResponse(INVALID_PASSWORD);
  }

  return null;
}
