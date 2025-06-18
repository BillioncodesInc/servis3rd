import accountsData from '../data/accounts.json';
import transactionsData from '../data/transactions.json';
import { Account, Transaction } from '../types';
import stateService from './stateService';

const accountService = {
  getUserAccounts(userId: string): Account[] {
    // Set current user in state service
    stateService.setCurrentUser(userId);
    
    // Get accounts from state
    return stateService.getAccounts();
  },

  getAccountById(accountId: string): Account | undefined {
    return stateService.getAccountById(accountId);
  },

  getUserTransactions(userId: string): Transaction[] {
    // Set current user in state service
    stateService.setCurrentUser(userId);
    
    // Get all user transactions
    return stateService.getTransactions();
  },

  getAccountTransactions(accountId: string): Transaction[] {
    return stateService.getTransactions(accountId);
  },

  transferFunds(
    fromAccountId: string,
    toAccountId: string | null,
    amount: number,
    description: string,
    category: string = 'Transfer'
  ): boolean {
    const fromAccount = stateService.getAccountById(fromAccountId);
    if (!fromAccount || fromAccount.balance < amount) {
      return false;
    }

    const timestamp = new Date().toISOString();

    // Create debit transaction
    stateService.addTransaction({
      accountId: fromAccountId,
      date: timestamp,
      description,
      amount: -amount,
      type: 'debit',
      category,
      status: 'completed',
      balance: fromAccount.balance - amount
    });

    // Create credit transaction if internal transfer
    if (toAccountId) {
      const toAccount = stateService.getAccountById(toAccountId);
      if (toAccount) {
        stateService.addTransaction({
          accountId: toAccountId,
          date: timestamp,
          description,
          amount,
          type: 'credit',
          category,
          status: 'completed',
          balance: toAccount.balance + amount
        });
      }
    }

    return true;
  },

  updateAccountBalance(accountId: string, newBalance: number): void {
    stateService.updateAccount(accountId, { balance: newBalance, availableBalance: newBalance });
  },

  getAccountNumber(accountType: string): string {
    return stateService.generateAccountNumber(accountType as 'checking' | 'savings' | 'credit' | 'loan');
  }
};

export default accountService; 