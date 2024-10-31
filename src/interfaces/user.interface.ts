export interface User {
  id: number;
  email: string;
  name: string;
  date_of_birth: Date;
  lga_id: number;
  city: string;
  address: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
