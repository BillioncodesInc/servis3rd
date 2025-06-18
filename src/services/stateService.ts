// State management service for persistent data across sessions
import { Account, Transaction } from '../types';

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: any[];
  lastUpdated: string;
}

class StateService {
  private readonly STATE_KEY = 'servis3rd_app_state';
  private readonly USER_STATE_PREFIX = 'servis3rd_user_state_';

  // Generate realistic account numbers based on account type
  generateAccountNumber(accountType: string, userId: string, index: number): string {
    const typePrefix: { [key: string]: string } = {
      'checking': '1001',
      'savings': '2001',
      'credit': '4001',
      'loan': '8001',
    };

    const userNumeric = userId.replace(/\D/g, '').padStart(3, '0');
    const sequence = (index + 1).toString().padStart(4, '0');
    const checkDigit = this.calculateCheckDigit(`${typePrefix[accountType] || '9001'}${userNumeric}${sequence}`);
    
    return `${typePrefix[accountType] || '9001'}-${userNumeric}-${sequence}-${checkDigit}`;
  }

  // Luhn algorithm for check digit
  private calculateCheckDigit(num: string): string {
    let sum = 0;
    let isEven = false;
    
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return ((10 - (sum % 10)) % 10).toString();
  }

  // Get user-specific state
  getUserState(userId: string): AppState | null {
    const stateJson = localStorage.getItem(this.USER_STATE_PREFIX + userId);
    if (!stateJson) return null;
    
    try {
      return JSON.parse(stateJson);
    } catch {
      return null;
    }
  }

  // Save user-specific state
  saveUserState(userId: string, state: Partial<AppState>): void {
    const currentState = this.getUserState(userId) || {
      accounts: [],
      transactions: [],
      budgets: [],
      lastUpdated: new Date().toISOString(),
    };

    const updatedState: AppState = {
      ...currentState,
      ...state,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(this.USER_STATE_PREFIX + userId, JSON.stringify(updatedState));
  }

  // Process a transaction and update account balances
  processTransaction(
    userId: string,
    fromAccountId: string,
    toAccountId: string | null,
    amount: number,
    description: string,
    category: string = 'Transfer'
  ): boolean {
    const state = this.getUserState(userId);
    if (!state) return false;

    const accounts = [...state.accounts];
    const transactions = [...state.transactions];

    // Find accounts
    const fromAccount = accounts.find(a => a.accountId === fromAccountId);
    if (!fromAccount || fromAccount.balance < amount) return false;

    // Create transaction ID
    const transactionId = `TXN${Date.now()}`;
    const date = new Date().toISOString();

    // Debit from source account
    fromAccount.balance -= amount;
    fromAccount.availableBalance = fromAccount.balance;

    // Create debit transaction
    transactions.push({
      transactionId: `${transactionId}_D`,
      accountId: fromAccountId,
      date,
      description,
      amount: -amount,
      type: 'debit',
      category,
      balance: fromAccount.balance,
      status: 'completed',
    });

    // Credit to destination account if internal transfer
    if (toAccountId) {
      const toAccount = accounts.find(a => a.accountId === toAccountId);
      if (toAccount) {
        toAccount.balance += amount;
        toAccount.availableBalance = toAccount.balance;

        // Create credit transaction
        transactions.push({
          transactionId: `${transactionId}_C`,
          accountId: toAccountId,
          date,
          description,
          amount,
          type: 'credit',
          category,
          balance: toAccount.balance,
          status: 'completed',
        });
      }
    }

    // Save updated state
    this.saveUserState(userId, { accounts, transactions });
    return true;
  }

  // Update budget spending
  updateBudgetSpending(userId: string, category: string, amount: number): void {
    const state = this.getUserState(userId);
    if (!state) return;

    const budgets = [...state.budgets];
    const currentMonth = new Date().toISOString().slice(0, 7);

    budgets.forEach(budget => {
      if (budget.period === 'monthly' && budget.startDate.slice(0, 7) === currentMonth) {
        const categoryBudget = budget.categories.find((c: any) => c.category === category);
        if (categoryBudget) {
          categoryBudget.spent += amount;
          budget.totalSpent += amount;
        }
      }
    });

    this.saveUserState(userId, { budgets });
  }

  // Get account with calculated interest (for savings accounts)
  getAccountWithInterest(account: Account): Account {
    if (account.accountType !== 'savings') return account;

    const lastUpdate = new Date(account.lastInterestDate || account.openDate || new Date());
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0) {
      const dailyRate = (account.interestRate || 0.0425) / 365;
      const interest = account.balance * dailyRate * daysDiff;
      
      return {
        ...account,
        balance: account.balance + interest,
        availableBalance: account.balance + interest,
        lastInterestDate: now.toISOString(),
      };
    }

    return account;
  }

  // Initialize user state from JSON files if not exists
  initializeUserState(userId: string, initialAccounts: Account[], initialTransactions: Transaction[], initialBudgets: any[]): void {
    const existingState = this.getUserState(userId);
    if (!existingState) {
      // Generate proper account numbers for all accounts
      const accountsWithNumbers = initialAccounts.map((account, index) => ({
        ...account,
        accountNumber: this.generateAccountNumber(account.accountType, userId, index),
        openDate: account.openDate || new Date(2023, 0, 15).toISOString(),
        lastActivityDate: new Date().toISOString(),
      }));

      this.saveUserState(userId, {
        accounts: accountsWithNumbers,
        transactions: initialTransactions,
        budgets: initialBudgets,
      });
    }
  }

  // Clear all state (for logout)
  clearState(): void {
    // We don't clear user-specific states on logout
    // They persist for when the user logs back in
  }
}

const stateService = new StateService();
export default stateService; 