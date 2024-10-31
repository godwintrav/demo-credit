import {
  ACCOUNT_NOT_FOUND,
  INSUFFICIENT_FUNDS,
  RECEIVER_ACCOUNT_NOT_FOUND,
  SUCCESS_MSG,
} from '../../constants';
import { Account } from '../../interfaces/account.interface';
import { AccountApiResponse } from '../../interfaces/api-response.interface';
import { Transaction } from '../../interfaces/transaction.interface';
import { UserAccount } from '../../interfaces/user-account.interface';
import { User } from '../../interfaces/user.interface';
import { AccountModel } from './account.model';

//This class handles business logic for users
export class AccountService {
  constructor(private readonly accountModel: AccountModel) {}

  async fundUserAccountService(
    userId: number,
    amount: number,
  ): Promise<AccountApiResponse> {
    //find account
    const account: Account | undefined =
      await this.accountModel.findAccountByUserId(userId);
    if (!account) {
      return { message: ACCOUNT_NOT_FOUND, statusCode: 404 };
    }

    // add amount to current balance
    const newBalance = parseFloat(account.balance.toString()) + amount;

    //update account with account id to utilise indexing with primary key
    account.balance = newBalance;
    await this.accountModel.updateAccount(account.id, account);

    const transaction: Omit<Transaction, 'id'> = {
      user_id: userId,
      transaction_type: 'fund',
      amount,
    };
    //no await so create transaction can be run in the background
    this.accountModel.createTransaction(transaction);
    return { message: SUCCESS_MSG, statusCode: 200, account };
  }

  async withdrawAmountService(
    userId: number,
    amount: number,
  ): Promise<AccountApiResponse> {
    //find account
    const account: Account | undefined =
      await this.accountModel.findAccountByUserId(userId);
    if (!account) {
      return { message: ACCOUNT_NOT_FOUND, statusCode: 404 };
    }

    const currentUserBalance = parseFloat(account.balance.toString());
    if (amount > currentUserBalance) {
      return { message: INSUFFICIENT_FUNDS, statusCode: 402 };
    }

    // add amount to current balance
    const newBalance = currentUserBalance - amount;

    //update account with account id to utilise indexing with primary key
    account.balance = newBalance;
    await this.accountModel.updateAccount(account.id, account);

    const transaction: Omit<Transaction, 'id'> = {
      user_id: userId,
      transaction_type: 'withdraw',
      amount,
    };
    //no await so create transaction can be run in the background
    this.accountModel.createTransaction(transaction);

    return { message: SUCCESS_MSG, statusCode: 200, account };
  }

  async transferAmountService(
    senderId: number,
    amount: number,
    receiverEmail: string,
  ): Promise<AccountApiResponse> {
    //find user account
    const senderAccount: Account | undefined =
      await this.accountModel.findAccountByUserId(senderId);
    if (!senderAccount) {
      return { message: ACCOUNT_NOT_FOUND, statusCode: 404 };
    }

    //check user has enough funds
    const senderBalance = parseFloat(senderAccount.balance.toString());
    if (amount > senderBalance) {
      return { message: INSUFFICIENT_FUNDS, statusCode: 402 };
    }

    //find receiver account
    const receiverAccount: Account | undefined =
      await this.accountModel.findAccountByEmail(receiverEmail);
    if (!receiverAccount) {
      return { message: RECEIVER_ACCOUNT_NOT_FOUND, statusCode: 404 };
    }

    if (receiverAccount.id == senderAccount.id) {
      return { message: "Can't transfer to same account", statusCode: 402 };
    }

    // update user and receiver account
    const updatedSenderBalance = senderBalance - amount;
    const updatedReceiverBalance =
      parseFloat(receiverAccount.balance.toString()) + amount;

    //update account with account id to utilise indexing with primary key with primary key
    senderAccount.balance = updatedSenderBalance;
    receiverAccount.balance = updatedReceiverBalance;
    await this.accountModel.updateTransfer(
      senderAccount.id,
      senderAccount,
      receiverAccount.id,
      receiverAccount,
    );

    const senderTransaction: Omit<Transaction, 'id'> = {
      user_id: senderId,
      transaction_type: 'transferOut',
      amount,
    };
    //no await so create transaction can be run in the background
    this.accountModel.createTransaction(senderTransaction);

    const receiverTransaction: Omit<Transaction, 'id'> = {
      user_id: receiverAccount.user_id,
      transaction_type: 'transferIn',
      amount,
    };
    //no await so create transaction can be run in the background
    this.accountModel.createTransaction(receiverTransaction);

    return { message: SUCCESS_MSG, statusCode: 200, account: senderAccount };
  }

  async getUserAccount(userId: number): Promise<AccountApiResponse> {
    //find user account
    const userAccount: UserAccount | undefined =
      await this.accountModel.findUserAndAccountById(userId);
    if (!userAccount) {
      return { message: ACCOUNT_NOT_FOUND, statusCode: 404 };
    }

    const account: Account = {
      balance: userAccount.balance,
      id: userAccount.id,
      user_id: userAccount.user_id,
    };
    const user: Partial<User> = {
      name: userAccount.name,
      address: userAccount.address,
      city: userAccount.city,
      date_of_birth: userAccount.date_of_birth,
      email: userAccount.email,
      lga_id: userAccount.lga_id,
      id: userAccount.id,
    };

    return { account, user, statusCode: 200, message: SUCCESS_MSG };
  }
}
