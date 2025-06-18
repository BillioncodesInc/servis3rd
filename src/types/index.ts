export interface User {
  userId: string;
  companyId?: string;
  password: string;
  userType: 'personal' | 'business';
  profile: UserProfile;
  settings: UserSettings;
  lastLogin: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  ssn?: string;
  memberSince?: string;
  companyName?: string;
  ein?: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface UserSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  paperlessStatements: boolean;
  twoFactorAuth: boolean;
  defaultAccount?: string;
}

export interface Account {
  accountId: string;
  userId: string;
  accountType: 'checking' | 'savings' | 'credit' | 'loan';
  accountNumber: string;
  fullAccountNumber?: string;
  routingNumber?: string;
  accountName: string;
  balance: number;
  availableBalance?: number;
  creditLimit?: number;
  originalAmount?: number;
  currency: string;
  status: 'active' | 'inactive' | 'closed';
  openDate: string;
  interestRate: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  minimumPayment?: number;
  paymentDueDate?: string;
  lastActivityDate?: string;
  lastInterestDate?: string;
}

export interface Transaction {
  transactionId: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  status: 'pending' | 'completed' | 'failed';
  balance: number;
}

export interface Transfer {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  scheduledDate?: string;
  recurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Payee {
  payeeId: string;
  userId: string;
  name: string;
  accountNumber: string;
  category: string;
  isFavorite: boolean;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  isActive?: boolean;
}

export interface Bill {
  billId: string;
  payeeId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'scheduled' | 'paid';
  recurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
} 