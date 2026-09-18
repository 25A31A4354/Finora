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

/**
 * Normalizes any free-form string or category suggestion into one of the 11 standard ExpenseCategory types
 */
export function normalizeCategory(categoryStr?: string, description?: string): ExpenseCategory {
  if (categoryStr) {
    const trimmed = categoryStr.trim();
    const exact = VALID_CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exact) return exact;

    const lower = trimmed.toLowerCase();
    if (/food|dine|dining|restaurant|cafe|coffee|tea|biscuit|snack|grocer|meal|swiggy|zomato/i.test(lower)) {
      return 'Food & Dining';
    }
    if (/utilit|bill|electric|power|water|gas|wifi|internet|broadband|recharge|mobile bill|phone bill|maintenance/i.test(lower)) {
      return 'Utilities & Bills';
    }
    if (/shop|gadget|phone|mobile|laptop|computer|electronics|clothes|apparel|shoes|macbook/i.test(lower)) {
      return 'Shopping & Gadgets';
    }
    if (/rent|housing|house|flat|apartment|pg|deposit|mortgage/i.test(lower)) {
      return 'Housing & Rent';
    }
    if (/transport|fuel|petrol|diesel|travel|uber|ola|cab|auto|metro|bus|train|fare|toll/i.test(lower)) {
      return 'Transport & Fuel';
    }
    if (/educat|college|school|tuition|fee|fees|course|books|university/i.test(lower)) {
      return 'Education';
    }
    if (/health|medic|doctor|hospital|clinic|pharmacy|dental/i.test(lower)) {
      return 'Healthcare';
    }
    if (/entertain|movie|cinema|netflix|spotify|party|game|gaming|club/i.test(lower)) {
      return 'Entertainment';
    }
    if (/travel|trip|tour|flight|hotel|resort|vacation/i.test(lower)) {
      return 'Travel';
    }
    if (/personal|care|salon|haircut|spa|gym|fitness|cosmetic/i.test(lower)) {
      return 'Personal Care';
    }
  }

  // Fallback to inspecting description
  if (description) {
    const lowerDesc = description.toLowerCase();
    if (/food|dine|dining|restaurant|cafe|coffee|tea|snack|biscuit|lunch|dinner|breakfast|meal|pizza|burger|grocer|swiggy|zomato|vegetable|fruit|milk|bread|cake|drink/i.test(lowerDesc)) {
      return 'Food & Dining';
    }
    if (/electric|power|water|gas|wifi|internet|broadband|recharge|phone bill|mobile bill|utility|utilities|bill|bills|maid|cook|maintenance|clean/i.test(lowerDesc)) {
      return 'Utilities & Bills';
    }
    if (/phone|mobile|laptop|macbook|computer|ipad|tablet|headphone|airpod|gadget|electronic|cloth|shirt|pant|shoe|watch|shopping|amazon|flipkart|myntra|zara|apparel|dress/i.test(lowerDesc)) {
      return 'Shopping & Gadgets';
    }
    if (/rent|lease|mortgage|flat|apartment|house|room|hostel|pg|deposit/i.test(lowerDesc)) {
      return 'Housing & Rent';
    }
    if (/fuel|petrol|diesel|gasoline|uber|ola|auto|cab|taxi|metro|bus|train|railway|fare|toll|flight|parking/i.test(lowerDesc)) {
      return 'Transport & Fuel';
    }
    if (/college|school|fee|fees|tuition|course|book|exam|university|class|education|training|coaching/i.test(lowerDesc)) {
      return 'Education';
    }
    if (/medic|doctor|hospital|clinic|pharmacy|pill|health|dental|dentist|lab|test|checkup/i.test(lowerDesc)) {
      return 'Healthcare';
    }
    if (/movie|cinema|film|theatre|netflix|prime|hotstar|spotify|concert|show|event|party|club|game|gaming|steam/i.test(lowerDesc)) {
      return 'Entertainment';
    }
    if (/trip|tour|vacation|flight|hotel|resort|airbnb|travel|sightseeing/i.test(lowerDesc)) {
      return 'Travel';
    }
    if (/salon|haircut|spa|massage|gym|fitness|yoga|grooming|cosmetic|makeup/i.test(lowerDesc)) {
      return 'Personal Care';
    }
  }

  return 'Other';
}

/**
 * Standard Indian Rupee (INR) currency formatter
 * E.g., 30000 -> ₹30,000, 150000 -> ₹1,50,000
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Computes exact deterministic financial summary
 */
export function calculateFinancialSummary(
  incomes: IncomeRecord[],
  expenses: ExpenseRecord[],
  futureExpenses: FutureExpenseRecord[]
): FinancialSummary {
  // Sum monthly recurring income
  const monthlyRecurringIncome = incomes
    .filter(inc => inc.frequency === 'monthly')
    .reduce((acc, inc) => acc + (Number(inc.amount) || 0), 0);

  // Sum one-time income records
  const totalOneTimeIncome = incomes
    .filter(inc => inc.frequency !== 'monthly')
    .reduce((acc, inc) => acc + (Number(inc.amount) || 0), 0);

  // Effective income for current cycle: one-time + monthly recurring
  const effectiveIncome = totalOneTimeIncome + monthlyRecurringIncome;
  const totalIncomeRecorded = totalOneTimeIncome + monthlyRecurringIncome;

  // Sum past and recorded expenses
  const totalSpendingRecorded = expenses.reduce(
    (acc, exp) => acc + (Number(exp.amount) || 0),
    0
  );

  // Sum upcoming commitments
  const totalUpcomingLiabilities = futureExpenses.reduce(
    (acc, fut) => acc + (Number(fut.amount) || 0),
    0
  );

  // Recorded balance = effective income - total spending
  const recordedBalance = effectiveIncome - totalSpendingRecorded;

  // Net buffer after fulfilling upcoming commitments
  const netBufferAfterUpcoming = recordedBalance - totalUpcomingLiabilities;

  // Calculate categorical breakdown
  const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();

  for (const exp of expenses) {
    const cat = exp.category || 'Other';
    const curr = categoryMap.get(cat) || { total: 0, count: 0 };
    categoryMap.set(cat, {
      total: curr.total + (Number(exp.amount) || 0),
      count: curr.count + 1,
    });
  }

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
