import { Account, Transaction } from '../types';
import accountsData from '../data/accounts.json';
import transactionsData from '../data/transactions.json';

class AccountService {
  private accounts: Account[] = accountsData.accounts as Account[];
  private transactions: Transaction[] = transactionsData.transactions as Transaction[];

  // Get accounts for a user
  getUserAccounts(userId: string): Account[] {
    return this.accounts.filter(account => account.userId === userId);
  }

  // Get account by ID
  getAccount(accountId: string): Account | undefined {
    return this.accounts.find(account => account.accountId === accountId);
  }

  // Update account balance
  updateAccountBalance(accountId: string, newBalance: number): boolean {
    const accountIndex = this.accounts.findIndex(acc => acc.accountId === accountId);
    if (accountIndex === -1) return false;

    this.accounts[accountIndex].balance = newBalance;
    this.accounts[accountIndex].availableBalance = newBalance;

    // In a real app, this would persist to a database
    // For now, we'll store in localStorage
    this.saveToLocalStorage();
    return true;
  }

  // Process transfer between accounts
  processTransfer(fromAccountId: string, toAccountId: string, amount: number, description: string = 'Transfer'): boolean {
    const fromAccount = this.getAccount(fromAccountId);
    const toAccount = this.getAccount(toAccountId);

    if (!fromAccount || !toAccount) return false;
    if (fromAccount.balance < amount) return false;

    // Update balances
    const newFromBalance = fromAccount.balance - amount;
    const newToBalance = toAccount.balance + amount;

    this.updateAccountBalance(fromAccountId, newFromBalance);
    this.updateAccountBalance(toAccountId, newToBalance);

    // Create transaction records
    const timestamp = new Date().toISOString();
    const transactionIdBase = `TRX${Date.now()}`;

    // Debit transaction for source account
    const debitTransaction: Transaction = {
      transactionId: `${transactionIdBase}_1`,
      accountId: fromAccountId,
      date: timestamp,
      description: `${description} to ${toAccount.accountName}`,
      amount: -amount,
      type: 'debit',
      category: 'Transfer',
      status: 'completed',
      balance: newFromBalance
    };

    // Credit transaction for destination account
    const creditTransaction: Transaction = {
      transactionId: `${transactionIdBase}_2`,
      accountId: toAccountId,
      date: timestamp,
      description: `${description} from ${fromAccount.accountName}`,
      amount: amount,
      type: 'credit',
      category: 'Transfer',
      status: 'completed',
      balance: newToBalance
    };

    this.transactions.unshift(debitTransaction, creditTransaction);
    this.saveToLocalStorage();

    return true;
  }

  // Get transactions for an account
  getAccountTransactions(accountId: string): Transaction[] {
    return this.transactions.filter(t => t.accountId === accountId);
  }

  // Get all transactions for a user
  getUserTransactions(userId: string): Transaction[] {
    const userAccountIds = this.getUserAccounts(userId).map(acc => acc.accountId);
    return this.transactions.filter(t => userAccountIds.includes(t.accountId));
  }

  // Save to localStorage (simulating database persistence)
  private saveToLocalStorage() {
    localStorage.setItem('accounts', JSON.stringify(this.accounts));
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
  }

  // Load from localStorage
  loadFromLocalStorage() {
    const savedAccounts = localStorage.getItem('accounts');
    const savedTransactions = localStorage.getItem('transactions');

    if (savedAccounts) {
      this.accounts = JSON.parse(savedAccounts);
    }
    if (savedTransactions) {
      this.transactions = JSON.parse(savedTransactions);
    }
  }

  // Reset to original data
  resetData() {
    this.accounts = accountsData.accounts as Account[];
    this.transactions = transactionsData.transactions as Transaction[];
    localStorage.removeItem('accounts');
    localStorage.removeItem('transactions');
  }
}

// Create singleton instance
const accountService = new AccountService();
accountService.loadFromLocalStorage();

export default accountService; 