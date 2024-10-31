import { validateRegistration } from '../user.validation';
import { errorResponse } from '../../../utils/errorResponse';
import validator from 'validator';
import {
  ADDRESS_REQUIRED,
  CITY_REQUIRED,
  INVALID_DOB,
  INVALID_EMAIL_ADDRESS,
  INVALID_NAME,
  INVALID_PASSWORD,
  LGA_REQUIRED,
} from '../../../utils/constants';
import { CreateUserApiResponse } from '../../../interfaces/api-response.interface';

describe('validateRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should return null for valid input', () => {
    const validInput = {
      address: '123 Main St',
      name: 'John Doe',
      email: 'johndoe@example.com',
      city: 'Lagos',
      date_of_birth: '1990-01-01',
      lga_id: '123',
      password: 'securepassword',
    };

    const result = validateRegistration(validInput);
    expect(result).toBeNull();
  });

  it('should return error response for missing address', () => {
    const input = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      city: 'Lagos',
      date_of_birth: '1990-01-01',
      lga_id: '123',
      password: 'securepassword',
    };

    const result: CreateUserApiResponse | null = validateRegistration(input);
    expect(result).toEqual(errorResponse(ADDRESS_REQUIRED));
  });

  it('should return error response for missing name', () => {
    const input = {
      address: '123 Main St',
      email: 'johndoe@example.com',
      city: 'Lagos',
      date_of_birth: '1990-01-01',
      lga_id: '123',
      password: 'securepassword',
    };

    const result: CreateUserApiResponse | null = validateRegistration(input);
    expect(result).toEqual(errorResponse(INVALID_NAME));
  });

  it('should return error response for invalid email', () => {
    jest.spyOn(validator, 'isEmail').mockReturnValue(false);

    const input = {
      address: '123 Main St',
      name: 'John Doe',
      email: 'invalid-email',
      city: 'Lagos',
      date_of_birth: '1990-01-01',
      lga_id: '123',
      password: 'securepassword',
    };

    const result: CreateUserApiResponse | null = validateRegistration(input);
    expect(result).toEqual(errorResponse(INVALID_EMAIL_ADDRESS));
    jest.restoreAllMocks();
  });

  it('should return error response for missing city', () => {
    const input = {
      address: '123 Main St',
      name: 'John Doe',
      email: 'johndoe@example.com',
      date_of_birth: '1990-01-01',
      lga_id: '123',
      password: 'securepassword',
    };

    const result: CreateUserApiResponse | null = validateRegistration(input);
    expect(result).toEqual(errorResponse(CITY_REQUIRED));
  });

  it('should return error response for invalid date of birth', () => {
    jest.spyOn(validator, 'isDate').mockReturnValue(false); // Mocking validator response

    const input = {
      address: '123 Main St',
      name: 'John Doe',
      email: 'johndoe@example.com',
      city: 'Lagos',
      date_of_birth: 'invalid-date',
      lga_id: '123',
      password: 'securepassword',
    };

    const result: CreateUserApiResponse | null = validateRegistration(input);
    expect(result).toEqual(errorResponse(INVALID_DOB));
    jest.restoreAllMocks();
  });

  it('should return error response for missing lga_id', () => {
    const input = {
      address: '123 Main St',
      name: 'John Doe',
      email: 'johndoe@example.com',
      city: 'Lagos',
      date_of_birth: '1990-01-01',
      password: 'securepassword',
    };

    const result: CreateUserApiResponse | null = validateRegistration(input);
    expect(result).toEqual(errorResponse(LGA_REQUIRED));
  });

  it('should return error response for invalid lga_id', () => {
    const input = {
      address: '123 Main St',
      name: 'John Doe',
      email: 'johndoe@example.com',
      city: 'Lagos',
      date_of_birth: '1990-01-01',
      lga_id: 'invalid-id',
      password: 'securepassword',
    };

    const result: CreateUserApiResponse | null = validateRegistration(input);
    expect(result).toEqual(errorResponse(LGA_REQUIRED));
  });

  it('should return error response for missing password', () => {
    const input = {
      address: '123 Main St',
      name: 'John Doe',
      email: 'johndoe@example.com',
      city: 'Lagos',
      date_of_birth: '1990-01-01',
      lga_id: '123',
    };

    const result: CreateUserApiResponse | null = validateRegistration(input);
    expect(result).toEqual(errorResponse(INVALID_PASSWORD));
  });

  it('should return error response for short password', () => {
    const input = {
      address: '123 Main St',
      name: 'John Doe',
      email: 'johndoe@example.com',
      city: 'Lagos',
      date_of_birth: '1990-01-01',
      lga_id: '123',
      password: '123',
    };

    const result: CreateUserApiResponse | null = validateRegistration(input);
    expect(result).toEqual(errorResponse(INVALID_PASSWORD));
  });
});
