// State management service for persistent data across sessions
import { Account, Transaction, Budget, Card, CardTransaction } from '../types';
import accountsData from '../data/accounts.json';
import transactionsData from '../data/transactions.json';
import budgetsData from '../data/budgets.json';
import cardsData from '../data/cards.json';

interface UserState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget | null;
  cards: Card[];
  cardTransactions: CardTransaction[];
}

interface AppState {
  [userId: string]: UserState;
}

class StateService {
  private static instance: StateService;
  private state: AppState = {};
  private currentUserId: string | null = null;

  private constructor() {
    this.loadState();
  }

  static getInstance(): StateService {
    if (!StateService.instance) {
      StateService.instance = new StateService();
    }
    return StateService.instance;
  }

  private loadState(): void {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      this.state = JSON.parse(savedState);
    }
  }

  private saveState(): void {
    localStorage.setItem('appState', JSON.stringify(this.state));
  }

  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    
    // Initialize user state if not exists
    if (!this.state[userId]) {
      this.state[userId] = this.loadUserData(userId);
      this.saveState();
    }
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  private getUserState(userId: string): UserState | null {
    return this.state[userId] || null;
  }

  private saveUserState(userId: string, userState: UserState): void {
    this.state[userId] = userState;
    this.saveState();
  }

  clearCurrentUser(): void {
    this.currentUserId = null;
    // Note: We don't clear the state here
    // User data persists for when they log back in
  }

  private loadUserData(userId: string): UserState {
    // Load accounts with proper type casting
    const userAccounts = accountsData.accounts
      .filter((acc: any) => acc.userId === userId)
      .map((acc: any) => ({
        accountId: acc.accountId,
        userId: acc.userId,
        accountType: acc.accountType as 'checking' | 'savings' | 'credit' | 'loan',
        accountNumber: acc.accountNumber,
        fullAccountNumber: acc.fullAccountNumber,
        routingNumber: acc.routingNumber,
        accountName: acc.accountName,
        balance: acc.balance,
        availableBalance: acc.availableBalance,
        currency: acc.currency,
        openDate: acc.openDate,
        lastActivityDate: acc.lastActivityDate,
        status: acc.status,
        interestRate: acc.interestRate,
        creditLimit: acc.creditLimit,
        minimumPayment: acc.minimumPayment,
        paymentDueDate: acc.paymentDueDate,
        originalAmount: acc.originalAmount,
        nextPaymentDate: acc.nextPaymentDate,
        nextPaymentAmount: acc.nextPaymentAmount,
        lastInterestDate: acc.lastInterestDate
      }));
    
    // Load transactions with proper type casting
    const accountIds = userAccounts.map(acc => acc.accountId);
    const userTransactions = transactionsData.transactions
      .filter((trans: any) => accountIds.includes(trans.accountId))
      .map((trans: any) => ({
        transactionId: trans.transactionId,
        accountId: trans.accountId,
        date: trans.date,
        description: trans.description,
        amount: trans.amount,
        type: trans.type as 'credit' | 'debit',
        category: trans.category,
        status: trans.status,
        balance: trans.balance
      }));
    
    // Load budgets with proper structure
    const budgetData = budgetsData.budgets.find((budget: any) => budget.userId === userId);
    const userBudget: Budget | null = budgetData ? {
      userId: budgetData.userId,
      categories: budgetData.categories.reduce((acc: any, cat: any) => {
        acc[cat.category] = {
          limit: cat.limit,
          spent: cat.spent,
          icon: cat.icon || '',
          color: cat.color
        };
        return acc;
      }, {}),
      monthlyLimit: budgetData.totalLimit,
      alerts: true
    } : null;
    
    // Load cards with proper type casting
    const userCards = cardsData.cards
      .filter((card: any) => card.userId === userId)
      .map((card: any) => ({
        ...card,
        cardType: card.cardType as 'debit' | 'credit',
        status: card.status as 'active' | 'frozen' | 'blocked'
      }));
    
    // Load card transactions with proper type casting
    const cardIds = userCards.map(card => card.id);
    const userCardTransactions = cardsData.cardTransactions
      .filter((trans: any) => cardIds.includes(trans.cardId))
      .map((trans: any) => ({
        ...trans,
        type: trans.type as 'purchase' | 'withdrawal' | 'refund'
      }));
    
    return {
      accounts: userAccounts,
      transactions: userTransactions,
      budgets: userBudget,
      cards: userCards,
      cardTransactions: userCardTransactions
    };
  }

  // Account methods
  getAccounts(): Account[] {
    if (!this.currentUserId) return [];
    const state = this.getUserState(this.currentUserId);
    return state?.accounts || [];
  }

  getAccountById(accountId: string): Account | undefined {
    const accounts = this.getAccounts();
    return accounts.find(acc => acc.accountId === accountId);
  }

  updateAccount(accountId: string, updates: Partial<Account>): void {
    if (!this.currentUserId) return;
    const state = this.getUserState(this.currentUserId);
    if (!state) return;

    const accountIndex = state.accounts.findIndex(acc => acc.accountId === accountId);
    if (accountIndex === -1) return;

    state.accounts[accountIndex] = {
      ...state.accounts[accountIndex],
      ...updates
    };

    this.saveUserState(this.currentUserId, state);
  }

  // Transaction methods
  getTransactions(accountId?: string): Transaction[] {
    if (!this.currentUserId) return [];
    const state = this.getUserState(this.currentUserId);
    const transactions = state?.transactions || [];
    
    if (accountId) {
      return transactions.filter(trans => trans.accountId === accountId);
    }
    
    return transactions;
  }

  addTransaction(transaction: Omit<Transaction, 'transactionId'>): void {
    if (!this.currentUserId) return;
    const state = this.getUserState(this.currentUserId);
    if (!state) return;

    const newTransaction: Transaction = {
      ...transaction,
      transactionId: `TRN${Date.now()}`
    };

    state.transactions.push(newTransaction);

    // Update account balance
    const account = state.accounts.find(acc => acc.accountId === transaction.accountId);
    if (account) {
      const balanceChange = transaction.type === 'credit' ? transaction.amount : -transaction.amount;
      account.balance += balanceChange;
      account.availableBalance = (account.availableBalance || account.balance) + balanceChange;
    }

    this.saveUserState(this.currentUserId, state);
  }

  // Budget methods
  getBudget(): Budget | null {
    if (!this.currentUserId) return null;
    const state = this.getUserState(this.currentUserId);
    return state?.budgets || null;
  }

  updateBudget(updates: Partial<Budget>): void {
    if (!this.currentUserId) return;
    const state = this.getUserState(this.currentUserId);
    if (!state || !state.budgets) return;

    state.budgets = {
      ...state.budgets,
      ...updates
    };

    this.saveUserState(this.currentUserId, state);
  }

  // Card methods
  getCards(): Card[] {
    if (!this.currentUserId) return [];
    const state = this.getUserState(this.currentUserId);
    return state?.cards || [];
  }

  getCardById(cardId: string): Card | undefined {
    const cards = this.getCards();
    return cards.find(card => card.id === cardId);
  }

  getCardTransactions(cardId?: string): CardTransaction[] {
    if (!this.currentUserId) return [];
    const state = this.getUserState(this.currentUserId);
    const transactions = state?.cardTransactions || [];
    
    if (cardId) {
      return transactions.filter(trans => trans.cardId === cardId);
    }
    
    return transactions;
  }

  updateCard(cardId: string, updates: Partial<Card>): void {
    if (!this.currentUserId) return;
    const state = this.getUserState(this.currentUserId);
    if (!state) return;

    const cardIndex = state.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;

    state.cards[cardIndex] = {
      ...state.cards[cardIndex],
      ...updates
    };

    this.saveUserState(this.currentUserId, state);
  }

  toggleCardStatus(cardId: string): void {
    const card = this.getCardById(cardId);
    if (!card) return;

    const newStatus = card.status === 'active' ? 'frozen' : 'active';
    this.updateCard(cardId, { 
      status: newStatus,
      // Disable all features when card is frozen
      contactless: newStatus === 'active' ? card.contactless : false,
      onlineTransactions: newStatus === 'active' ? card.onlineTransactions : false,
      internationalTransactions: newStatus === 'active' ? card.internationalTransactions : false,
      atmWithdrawals: newStatus === 'active' ? card.atmWithdrawals : false
    });
  }

  updateCardSettings(cardId: string, settings: Partial<Pick<Card, 'contactless' | 'onlineTransactions' | 'internationalTransactions' | 'atmWithdrawals'>>): void {
    this.updateCard(cardId, settings);
  }

  updateCardLimit(cardId: string, newLimit: number): void {
    this.updateCard(cardId, { limit: newLimit });
  }

  reportCardLost(cardId: string): void {
    this.updateCard(cardId, { 
      status: 'blocked',
      contactless: false,
      onlineTransactions: false,
      internationalTransactions: false,
      atmWithdrawals: false
    });
  }

  // Account number generation with Luhn algorithm
  generateAccountNumber(accountType: 'checking' | 'savings' | 'credit' | 'loan'): string {
    const typePrefix = {
      checking: '1001',
      savings: '2001',
      credit: '3001',
      loan: '4001'
    };

    const prefix = typePrefix[accountType];
    const middle = Math.floor(Math.random() * 900 + 100).toString();
    const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
    
    // Calculate check digit using Luhn algorithm
    const baseNumber = prefix + middle + suffix;
    const checkDigit = this.calculateLuhnCheckDigit(baseNumber);
    
    return `${prefix}-${middle}-${suffix}-${checkDigit}`;
  }

  private calculateLuhnCheckDigit(number: string): string {
    const digits = number.replace(/\D/g, '').split('').map(Number);
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }
}

export default StateService.getInstance(); 