/**
 * Application Financial Calculation Engine
 * 
 * Reliability Rule: All arithmetic, totals, percentages, balances,
 * and date scenario projections are executed in deterministic code.
 */

import {
  IncomeRecord,
  ExpenseRecord,
  FutureExpenseRecord,
  FinancialSummary,
  CategoryBreakdown,
  ExpenseCategory,
  CalculationDetail
} from '../types';

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Shopping & Gadgets': '#0EA5E9',   // Sky blue
  'Food & Dining': '#14B8A6',        // Teal
  'Housing & Rent': '#0D9488',       // Deep teal
  'Utilities & Bills': '#06B6D4',    // Cyan
  'Transport & Fuel': '#64748B',     // Slate
  'Entertainment': '#38BDF8',        // Light sky
  'Healthcare': '#10B981',           // Emerald
  'Education': '#2DD4BF',            // Soft teal
  'Travel': '#0284C7',               // Ocean blue
  'Personal Care': '#94A3B8',        // Cool grey
  'Other': '#475569',                // Deep slate
};

export const VALID_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Shopping & Gadgets',
  'Housing & Rent',
  'Utilities & Bills',
  'Transport & Fuel',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
];

// Pre-compiled category keyword detection rules
const CATEGORY_RULES: [ExpenseCategory, RegExp][] = [
  ['Food & Dining', /food|dine|dining|restaurant|cafe|coffee|tea|biscuit|snack|grocer|meal|swiggy|zomato|burger|pizza|bread|milk|lunch|dinner|breakfast|fruit|vegetable|drink/i],
  ['Utilities & Bills', /utilit|bill|bills|electric|power|water|gas|wifi|internet|broadband|recharge|mobile bill|phone bill|maintenance|maid|cook|clean/i],
  ['Shopping & Gadgets', /shop|shopping|gadget|phone|mobile|laptop|macbook|computer|ipad|tablet|headphone|airpod|electronic|cloth|shirt|pant|shoe|watch|amazon|flipkart|myntra|zara|apparel|dress/i],
  ['Housing & Rent', /rent|housing|house|flat|apartment|pg|deposit|mortgage|lease|room|hostel/i],
  ['Transport & Fuel', /transport|fuel|petrol|diesel|gasoline|travel|uber|ola|cab|auto|metro|bus|train|railway|fare|toll|flight|parking/i],
  ['Education', /educat|college|school|tuition|fee|fees|course|book|books|university|exam|class|training|coaching/i],
  ['Healthcare', /health|medic|doctor|hospital|clinic|pharmacy|dental|dentist|pill|lab|test|checkup/i],
  ['Entertainment', /entertain|movie|cinema|film|theatre|netflix|spotify|party|game|gaming|club|steam|hotstar|prime|concert|show|event/i],
  ['Travel', /travel|trip|tour|vacation|flight|hotel|resort|airbnb|sightseeing/i],
  ['Personal Care', /personal|care|salon|haircut|spa|massage|gym|fitness|yoga|grooming|cosmetic|makeup/i],
];

/**
 * Normalizes any free-form string or category suggestion into one of the 11 standard ExpenseCategory types
 */
export function normalizeCategory(categoryStr?: string, description?: string): ExpenseCategory {
  if (categoryStr) {
    const trimmed = categoryStr.trim();
    const exact = VALID_CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exact) return exact;

    for (let i = 0; i < CATEGORY_RULES.length; i++) {
      if (CATEGORY_RULES[i][1].test(trimmed)) {
        return CATEGORY_RULES[i][0];
      }
    }
  }

  if (description) {
    for (let i = 0; i < CATEGORY_RULES.length; i++) {
      if (CATEGORY_RULES[i][1].test(description)) {
        return CATEGORY_RULES[i][0];
      }
    }
  }

  return 'Other';
}

// Cached single instance of Intl.NumberFormat to avoid heavy instantiation per render
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * Standard Indian Rupee (INR) currency formatter
 * E.g., 30000 -> ₹30,000, 150000 -> ₹1,50,000
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const formatted = inrFormatter.format(Math.abs(Math.round(amount)));
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Computes exact deterministic financial summary in single passes
 */
export function calculateFinancialSummary(
  incomes: IncomeRecord[],
  expenses: ExpenseRecord[],
  futureExpenses: FutureExpenseRecord[]
): FinancialSummary {
  let monthlyRecurringIncome = 0;
  let totalOneTimeIncome = 0;

  for (let i = 0; i < incomes.length; i++) {
    const inc = incomes[i];
    const amt = Number(inc.amount) || 0;
    if (inc.frequency === 'monthly') {
      monthlyRecurringIncome += amt;
    } else {
      totalOneTimeIncome += amt;
    }
  }

  const effectiveIncome = totalOneTimeIncome + monthlyRecurringIncome;
  const totalIncomeRecorded = effectiveIncome;

  let totalSpendingRecorded = 0;
  const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();

  for (let i = 0; i < expenses.length; i++) {
    const exp = expenses[i];
    const amt = Number(exp.amount) || 0;
    totalSpendingRecorded += amt;

    const cat = exp.category || 'Other';
    const curr = categoryMap.get(cat);
    if (curr) {
      curr.total += amt;
      curr.count += 1;
    } else {
      categoryMap.set(cat, { total: amt, count: 1 });
    }
  }

  let totalUpcomingLiabilities = 0;
  for (let i = 0; i < futureExpenses.length; i++) {
    totalUpcomingLiabilities += Number(futureExpenses[i].amount) || 0;
  }

  const recordedBalance = effectiveIncome - totalSpendingRecorded;
  const netBufferAfterUpcoming = recordedBalance - totalUpcomingLiabilities;

  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalSpendingRecorded > 0 ? Math.round((data.total / totalSpendingRecorded) * 100) : 0,
      color: CATEGORY_COLORS[category] || '#0D9488',
    }))
    .sort((a, b) => b.total - a.total);

  return {
    totalIncomeRecorded,
    monthlyRecurringIncome,
    effectiveIncome,
    totalSpendingRecorded,
    totalUpcomingLiabilities,
    recordedBalance,
    netBufferAfterUpcoming,
    categoryBreakdown,
    incomeCount: incomes.length,
    expenseCount: expenses.length,
    futureExpenseCount: futureExpenses.length,
  };
}

/**
 * Deterministic Affordability & Scenario Calculation
 * Evaluates questions like "Can I afford a ₹40,000 phone?" and "What happens if I wait 2 months?"
 */
export function simulateAffordability(
  targetAmount: number,
  targetItem: string = 'purchase',
  waitMonths: number = 0,
  summary: FinancialSummary
): CalculationDetail {
  const currentBalance = summary.recordedBalance;
  const upcoming = summary.totalUpcomingLiabilities;
  const postPurchaseBalance = currentBalance - targetAmount;
  const netBuffer = postPurchaseBalance - upcoming;

  let verdict: 'AFFORDABLE' | 'TIGHT' | 'UNSAVVY_NOW' | 'INSUFFICIENT' = 'AFFORDABLE';
  let explanation = '';

  if (targetAmount > currentBalance) {
    verdict = 'INSUFFICIENT';
    explanation = `The requested amount (${formatINR(targetAmount)}) exceeds your current recorded balance of ${formatINR(currentBalance)} by ${formatINR(targetAmount - currentBalance)}.`;
  } else if (netBuffer < 0) {
    verdict = 'UNSAVVY_NOW';
    explanation = `While you have ${formatINR(currentBalance)} to cover ${formatINR(targetAmount)}, you have ${formatINR(upcoming)} in upcoming commitments, leaving a deficit of ${formatINR(Math.abs(netBuffer))}.`;
  } else if (netBuffer < summary.effectiveIncome * 0.15 && summary.effectiveIncome > 0) {
    verdict = 'TIGHT';
    explanation = `You can buy this, but your post-purchase buffer after upcoming liabilities will be very slim (${formatINR(netBuffer)}).`;
  } else {
    verdict = 'AFFORDABLE';
    explanation = `You have adequate buffer: after buying this for ${formatINR(targetAmount)} and reserving ${formatINR(upcoming)} for upcoming expenses, you will retain ${formatINR(netBuffer)}.`;
  }

  // Calculate wait scenario if waitMonths > 0 or if requested
  let waitScenario: CalculationDetail['waitMonthsScenario'] = undefined;

  if (waitMonths > 0) {
    const monthlyIncome = summary.monthlyRecurringIncome;
    const projectedIncomeAdded = monthlyIncome * waitMonths;
    // Estimated living expenses for those months based on current recorded spending
    const projectedBalanceWithoutPurchase = currentBalance + projectedIncomeAdded - upcoming;
    const projectedBalanceWithPurchase = projectedBalanceWithoutPurchase - targetAmount;

    waitScenario = {
      months: waitMonths,
      projectedIncomeAdded,
      projectedUpcomingExpenses: upcoming,
      projectedBalanceWithoutPurchase,
      projectedBalanceWithPurchase,
    };
  }

  return {
    title: `Affordability Analysis: ${targetItem}`,
    currentBalance,
    targetItem,
    targetAmount,
    postPurchaseBalance,
    upcomingDeductions: upcoming,
    netBuffer,
    verdict,
    verdictExplanation: explanation,
    waitMonthsScenario: waitScenario,
  };
}
