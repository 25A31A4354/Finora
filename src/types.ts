/**
 * Core Data Models and Types for Finora
 */

export type IncomeFrequency = 'one-time' | 'monthly' | 'yearly';

export interface IncomeRecord {
  id: string;
  amount: number;
  source: string;
  frequency: IncomeFrequency;
  date: string; // YYYY-MM-DD or readable
  createdAt: number;
}

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Shopping & Gadgets'
  | 'Housing & Rent'
  | 'Utilities & Bills'
  | 'Transport & Fuel'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Travel'
  | 'Personal Care'
  | 'Other';

export interface ExpenseRecord {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  createdAt: number;
}

export interface FutureExpenseRecord {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  expectedDate: string; // e.g. "December 2026" or "2026-12-15"
  notes?: string;
  createdAt: number;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  total: number;
  percentage: number;
  count: number;
  color: string;
}

export interface FinancialSummary {
  totalIncomeRecorded: number;
  monthlyRecurringIncome: number;
  effectiveIncome: number;
  totalSpendingRecorded: number;
  totalUpcomingLiabilities: number;
  recordedBalance: number;
  netBufferAfterUpcoming: number;
  categoryBreakdown: CategoryBreakdown[];
  incomeCount: number;
  expenseCount: number;
  futureExpenseCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  extractedActions?: ExtractedFinancialAction[];
  calculationDetails?: CalculationDetail;
  suggestedPrompts?: string[];
}

export interface ExtractedFinancialAction {
  type: 'add_income' | 'add_expense' | 'add_future_expense';
  amount: number;
  sourceOrDescription: string;
  category?: ExpenseCategory;
  dateOrFrequency?: string;
  recordId?: string;
}

export interface CalculationDetail {
  title?: string;
  currentBalance: number;
  targetItem?: string;
  targetAmount?: number;
  postPurchaseBalance?: number;
  upcomingDeductions?: number;
  netBuffer?: number;
  waitMonthsScenario?: {
    months: number;
    projectedIncomeAdded: number;
    projectedUpcomingExpenses: number;
    projectedBalanceWithoutPurchase: number;
    projectedBalanceWithPurchase: number;
  };
  verdict?: 'AFFORDABLE' | 'TIGHT' | 'UNSAVVY_NOW' | 'INSUFFICIENT';
  verdictExplanation?: string;
}
