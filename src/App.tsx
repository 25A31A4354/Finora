import React, { useState, useEffect, useMemo } from 'react';
import {
  IncomeRecord,
  ExpenseRecord,
  FutureExpenseRecord,
  ChatMessage,
  ExtractedFinancialAction,
  CalculationDetail,
  ExpenseCategory,
  IncomeFrequency,
} from './types';
import { calculateFinancialSummary, simulateAffordability, normalizeCategory } from './utils/finance';
import { Header } from './components/Header';
import { FinancialSnapshot } from './components/FinancialSnapshot';
import { CategoricalBreakdown } from './components/CategoricalBreakdown';
import { RecentActivity } from './components/RecentActivity';
import { ChatInterface } from './components/ChatInterface';
import { ManualEntryModal } from './components/ManualEntryModal';
import { Plus } from 'lucide-react';

const STORAGE_KEYS = {
  INCOMES: 'finora_incomes_v1',
  EXPENSES: 'finora_expenses_v1',
  FUTURE: 'finora_future_expenses_v1',
  MESSAGES: 'finora_messages_v1',
};

export default function App() {
  // 1. Session Financial State initialized strictly from sessionStorage or empty
  const [incomes, setIncomes] = useState<IncomeRecord[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.INCOMES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [futureExpenses, setFutureExpenses] = useState<FutureExpenseRecord[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.FUTURE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Track last queried item/amount for conversational follow-ups like "What happens if I wait 2 months?"
  const [lastTargetQuery, setLastTargetQuery] = useState<{ amount: number; item: string } | null>(null);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
    } catch (e) {
      console.error(e);
    }
  }, [incomes]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.FUTURE, JSON.stringify(futureExpenses));
    } catch (e) {
      console.error(e);
    }
  }, [futureExpenses]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  // Compute deterministic summary strictly from recorded live state
  const summary = useMemo(() => {
    return calculateFinancialSummary(incomes, expenses, futureExpenses);
  }, [incomes, expenses, futureExpenses]);

  const handleReset = () => {
    setIncomes([]);
    setExpenses([]);
    setFutureExpenses([]);
    setMessages([]);
    setLastTargetQuery(null);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.INCOMES);
      sessionStorage.removeItem(STORAGE_KEYS.EXPENSES);
      sessionStorage.removeItem(STORAGE_KEYS.FUTURE);
      sessionStorage.removeItem(STORAGE_KEYS.MESSAGES);
    } catch (e) {
      console.error(e);
    }
  };

  // Add records directly via modal
  const handleAddIncome = (
    amount: number,
    source: string,
    frequency: IncomeFrequency,
    date: string
  ) => {
    const newRecord: IncomeRecord = {
      id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount,
      source,
      frequency,
      date,
      createdAt: Date.now(),
    };
    setIncomes((prev) => [newRecord, ...prev]);

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Added ${frequency === 'monthly' ? 'monthly recurring' : 'one-time'} income of ₹${amount.toLocaleString('en-IN')} from "${source}".`,
      timestamp: Date.now(),
      extractedActions: [
        {
          type: 'add_income',
          amount,
          sourceOrDescription: source,
          dateOrFrequency: frequency,
          recordId: newRecord.id,
        },
      ],
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleAddExpense = (
    amount: number,
    description: string,
    category: ExpenseCategory,
    date: string
  ) => {
    const normalizedCat = normalizeCategory(category, description);
    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount,
      description,
      category: normalizedCat,
      date,
      createdAt: Date.now(),
    };
    setExpenses((prev) => [newRecord, ...prev]);

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Recorded spending of ₹${amount.toLocaleString('en-IN')} for "${description}" under ${normalizedCat}.`,
      timestamp: Date.now(),
      extractedActions: [
        {
          type: 'add_expense',
          amount,
          sourceOrDescription: description,
          category: normalizedCat,
          recordId: newRecord.id,
        },
      ],
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleAddFutureExpense = (
    amount: number,
    description: string,
    category: ExpenseCategory,
    expectedDate: string
  ) => {
    const normalizedCat = normalizeCategory(category, description);
    const newRecord: FutureExpenseRecord = {
      id: `fut-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount,
      description,
      category: normalizedCat,
      expectedDate,
      createdAt: Date.now(),
    };
    setFutureExpenses((prev) => [newRecord, ...prev]);

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Scheduled upcoming commitment of ₹${amount.toLocaleString('en-IN')} for "${description}" due ${expectedDate}.`,
      timestamp: Date.now(),
      extractedActions: [
        {
          type: 'add_future_expense',
          amount,
          sourceOrDescription: description,
          category: normalizedCat,
          dateOrFrequency: expectedDate,
          recordId: newRecord.id,
        },
      ],
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDeleteFutureExpense = (id: string) => {
    setFutureExpenses((prev) => prev.filter((f) => f.id !== id));
  };

  // Main chat processing
  const handleSendMessage = async (text: string) => {
    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Deterministic pre-calculation check for affordability or wait questions
      const lowerText = text.toLowerCase();
      let localCalcDetail: CalculationDetail | undefined = undefined;

      const affordMatch = lowerText.match(/(?:can i afford|should i buy|can we afford|is it safe to buy)\s*(?:a|an)?\s*₹?\s*([\d,]+)?\s*([^?]+)?/i);
      const waitMatch = lowerText.match(/what happens if i wait\s*(\d+)?\s*month/i);

      if (affordMatch) {
        const rawAmt = affordMatch[1] || (lowerText.match(/₹?\s*([\d,]+)/)?.[1] || '0');
        const targetAmt = parseInt(rawAmt.replace(/,/g, ''), 10);
        const item = (affordMatch[2] || 'item').replace(/₹?\s*[\d,]+/g, '').trim() || 'item';
        if (targetAmt > 0) {
          setLastTargetQuery({ amount: targetAmt, item });
          localCalcDetail = simulateAffordability(targetAmt, item, 0, summary);
        }
      } else if (waitMatch) {
        const months = parseInt(waitMatch[1] || '2', 10) || 2;
        const targetAmt = lastTargetQuery?.amount || 0;
        const item = lastTargetQuery?.item || 'Savings Buffer';
        localCalcDetail = simulateAffordability(targetAmt, item, months, summary);
      }

      // Send to server API with current live state
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
          financialState: {
            incomes,
            expenses,
            futureExpenses,
            summary,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const extracted = data.extractedActions || [];
      const appliedActions: ExtractedFinancialAction[] = [];

      // Collect records to batch add
      const newIncomesToAdd: IncomeRecord[] = [];
      const newExpensesToAdd: ExpenseRecord[] = [];
      const newFutureToAdd: FutureExpenseRecord[] = [];

      if (Array.isArray(extracted) && extracted.length > 0) {
        for (let idx = 0; idx < extracted.length; idx++) {
          const act = extracted[idx];
          const amount = Number(act.amount) || 0;
          if (amount <= 0) continue;

          const now = Date.now() + idx;

          if (act.actionType === 'add_income') {
            const freq: IncomeFrequency =
              act.frequency === 'monthly' || act.frequency === 'yearly'
                ? act.frequency
                : 'one-time';
            const newInc: IncomeRecord = {
              id: `inc-${now}-${Math.random().toString(36).substr(2, 4)}`,
              amount,
              source: act.sourceOrDescription || 'Income',
              frequency: freq,
              date: act.dateOrExpectedDate || new Date().toISOString().split('T')[0],
              createdAt: now,
            };
            newIncomesToAdd.push(newInc);
            appliedActions.push({
              type: 'add_income',
              amount,
              sourceOrDescription: newInc.source,
              dateOrFrequency: freq,
              recordId: newInc.id,
            });
          } else if (act.actionType === 'add_expense') {
            const category = normalizeCategory(act.category, act.sourceOrDescription);
            const newExp: ExpenseRecord = {
              id: `exp-${now}-${Math.random().toString(36).substr(2, 4)}`,
              amount,
              description: act.sourceOrDescription || 'Expense',
              category,
              date: act.dateOrExpectedDate || new Date().toISOString().split('T')[0],
              createdAt: now,
            };
            newExpensesToAdd.push(newExp);
            appliedActions.push({
              type: 'add_expense',
              amount,
              sourceOrDescription: newExp.description,
              category: newExp.category,
              recordId: newExp.id,
            });
          } else if (act.actionType === 'add_future_expense') {
            const category = normalizeCategory(act.category, act.sourceOrDescription);
            const newFut: FutureExpenseRecord = {
              id: `fut-${now}-${Math.random().toString(36).substr(2, 4)}`,
              amount,
              description: act.sourceOrDescription || 'Future Commitment',
              category,
              expectedDate: act.dateOrExpectedDate || 'Upcoming',
              createdAt: now,
            };
            newFutureToAdd.push(newFut);
            appliedActions.push({
              type: 'add_future_expense',
              amount,
              sourceOrDescription: newFut.description,
              category: newFut.category,
              dateOrFrequency: newFut.expectedDate,
              recordId: newFut.id,
            });
          }
        }

        if (newIncomesToAdd.length > 0) {
          setIncomes((prev) => [...newIncomesToAdd, ...prev]);
        }
        if (newExpensesToAdd.length > 0) {
          setExpenses((prev) => [...newExpensesToAdd, ...prev]);
        }
        if (newFutureToAdd.length > 0) {
          setFutureExpenses((prev) => [...newFutureToAdd, ...prev]);
        }
      }

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I have recorded this in your structured financial memory.',
        timestamp: Date.now(),
        extractedActions: appliedActions.length > 0 ? appliedActions : undefined,
        calculationDetails: localCalcDetail,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Error talking to Finora API:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `I had trouble connecting, but you can still record entries using the "+ Add Record" button anytime.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasData = incomes.length > 0 || expenses.length > 0 || futureExpenses.length > 0;

  return (
    <div className="min-h-screen bg-[#090D11] text-[#E6EDF3] flex flex-col selection:bg-teal-500/30 selection:text-teal-200">
      {/* Global Header */}
      <Header
        onReset={handleReset}
        hasData={hasData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Top Section: Financial Snapshot Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Financial Snapshot
              <span className="text-[10px] font-normal text-slate-400 capitalize px-2 py-0.5 rounded bg-[#141C26] border border-[#222E3E]">
                Live Session
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Computed deterministically from your recorded past, current, and future commitments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-manual-entry"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Snapshot Metric Cards */}
        <FinancialSnapshot summary={summary} />

        {/* Core Layout: Central Chat (60%) + Analytics/Activity Sidebar (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Chat Interface (Main Stage) */}
          <div className="lg:col-span-7 xl:col-span-7">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Breakdown & Activity Log */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            {/* Categorical Breakdown Card */}
            <CategoricalBreakdown
              breakdown={summary.categoryBreakdown}
              totalSpending={summary.totalSpendingRecorded}
            />

            {/* Recent Financial Activity Card */}
            <RecentActivity
              incomes={incomes}
              expenses={expenses}
              futureExpenses={futureExpenses}
              onDeleteIncome={handleDeleteIncome}
              onDeleteExpense={handleDeleteExpense}
              onDeleteFutureExpense={handleDeleteFutureExpense}
            />
          </div>
        </div>
      </main>

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
        onAddFutureExpense={handleAddFutureExpense}
      />
    </div>
  );
}
