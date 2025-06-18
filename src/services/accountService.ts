import { Account, Transaction } from '../types';
import accountsData from '../data/accounts.json';
import transactionsData from '../data/transactions.json';
import budgetsData from '../data/budgets.json';
import stateService from './stateService';

class AccountService {
  private accounts: Account[] = accountsData.accounts as Account[];
  private transactions: Transaction[] = transactionsData.transactions as Transaction[];

  // Get accounts for a user
  getUserAccounts(userId: string): Account[] {
    // Initialize user state if not exists
    const initialAccounts = this.accounts.filter(account => account.userId === userId);
    const initialTransactions = this.transactions.filter(t => 
      initialAccounts.some(a => a.accountId === t.accountId)
    );
    const initialBudgets = budgetsData.budgets.filter((b: any) => b.userId === userId);
    
    stateService.initializeUserState(userId, initialAccounts, initialTransactions, initialBudgets);
    
    // Get accounts from state
    const state = stateService.getUserState(userId);
    if (state && state.accounts) {
      // Apply interest calculations for savings accounts
      return state.accounts.map(account => stateService.getAccountWithInterest(account));
    }
    
    return initialAccounts;
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
    // Get the user ID from the account
    const fromAccount = this.getAccount(fromAccountId);
    if (!fromAccount) return false;
    
    // Use state service for transaction processing
    return stateService.processTransaction(
      fromAccount.userId,
      fromAccountId,
      toAccountId,
      amount,
      description,
      'Transfer'
    );
  }

  // Get transactions for an account
  getAccountTransactions(accountId: string): Transaction[] {
    return this.transactions.filter(t => t.accountId === accountId);
  }

  // Get all transactions for a user
  getUserTransactions(userId: string): Transaction[] {
    const state = stateService.getUserState(userId);
    if (state && state.transactions) {
      return state.transactions;
    }
    
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