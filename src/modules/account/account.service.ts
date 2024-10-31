import { AccountModel } from './account.model';

//This class handles business logic for users
export class UserService {
  constructor(private readonly accountModel: AccountModel) {}
}
