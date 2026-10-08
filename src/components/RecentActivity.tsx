import React, { useState, useMemo } from 'react';
import {
  IncomeRecord,
  ExpenseRecord,
  FutureExpenseRecord,
} from '../types';
import { formatINR } from '../utils/finance';
import {
  Trash2,
  Inbox,
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
} from 'lucide-react';

interface RecentActivityProps {
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  futureExpenses: FutureExpenseRecord[];
  onDeleteIncome: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteFutureExpense: (id: string) => void;
}

type FilterTab = 'all' | 'income' | 'spending' | 'upcoming';

export const RecentActivity: React.FC<RecentActivityProps> = ({
  incomes,
  expenses,
  futureExpenses,
  onDeleteIncome,
  onDeleteExpense,
  onDeleteFutureExpense,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Unify and sort activity items only when records change
  const allItems = useMemo(() => [
    ...incomes.map((i) => ({
      id: i.id,
      type: 'income' as const,
      title: i.source,
      amount: i.amount,
      tag: i.frequency === 'monthly' ? 'Monthly Recurring' : 'Inflow',
      date: i.date,
      createdAt: i.createdAt,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      type: 'expense' as const,
      title: e.description,
      amount: e.amount,
      tag: e.category,
      date: e.date,
      createdAt: e.createdAt,
    })),
    ...futureExpenses.map((f) => ({
      id: f.id,
      type: 'future' as const,
      title: f.description,
      amount: f.amount,
      tag: `${f.category} · Due ${f.expectedDate}`,
      date: f.expectedDate,
      createdAt: f.createdAt,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt), [incomes, expenses, futureExpenses]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return allItems;
    if (activeTab === 'income') return allItems.filter((item) => item.type === 'income');
    if (activeTab === 'spending') return allItems.filter((item) => item.type === 'expense');
    if (activeTab === 'upcoming') return allItems.filter((item) => item.type === 'future');
    return allItems;
  }, [allItems, activeTab]);

  return (
    <div
      id="card-recent-activity"
      className="apple-glass-card rounded-[24px] p-5 sm:p-6 flex flex-col"
    >
      {/* Ledger Header & iOS Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-4 pb-3.5 border-b border-black/[0.05]">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-[#121614] uppercase tracking-wider">
            Ledger & Transactions
          </h3>
          <span className="text-black/20 text-xs" aria-hidden="true">·</span>
          <span className="text-[11px] font-mono-num text-[#5E6662]">
            {allItems.length} records
          </span>
        </div>

        {/* Apple iOS Segmented Control */}
        <div className="flex items-center gap-0.5 bg-black/[0.04] p-1 rounded-full border border-black/[0.03] self-start sm:self-auto">
          {(['all', 'income', 'spending', 'upcoming'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`apple-press text-[11px] font-medium px-3 py-1 rounded-full transition-all cursor-pointer capitalize ${
                activeTab === tab
                  ? 'bg-white text-[#121614] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-[#5E6662] hover:text-[#121614]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Apple Wallet Style Transaction Items */}
      <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-black/[0.03] pr-1">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8D9691]">
            <div className="w-11 h-11 rounded-2xl bg-black/[0.03] border border-black/[0.04] flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-[#8D9691]" />
            </div>
            <p className="text-xs font-medium text-[#121614]">
              No {activeTab !== 'all' ? activeTab : ''} transactions recorded
            </p>
            <p className="text-[11px] text-[#8D9691] max-w-[260px] mt-1 leading-relaxed">
              New transactions appear here with chronological audit timestamps and instant deletion options.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="py-3 px-2 hover:bg-black/[0.02] rounded-xl transition-colors flex items-center justify-between gap-4 group"
            >
              {/* Left Column: Icon Capsule + Title + Tag */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                    item.type === 'income'
                      ? 'bg-emerald-50 text-[#059669] border-emerald-100/60'
                      : item.type === 'expense'
                      ? 'bg-black/[0.03] text-[#121614] border-black/[0.04]'
                      : 'bg-amber-50 text-amber-700 border-amber-100/60'
                  }`}
                >
                  {item.type === 'income' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : item.type === 'expense' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <CalendarClock className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#121614] truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] font-mono-num text-[#8D9691] flex items-center gap-1.5 mt-0.5 truncate">
                    <span className="text-[#5E6662] truncate">{item.tag}</span>
                    <span aria-hidden="true" className="text-black/20">·</span>
                    <span className="shrink-0">{item.date}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Amount + Delete Icon */}
              <div className="flex items-center gap-3.5 shrink-0">
                <span
                  className={`text-xs font-semibold font-mono-num ${
                    item.type === 'income'
                      ? 'text-[#059669]'
                      : item.type === 'expense'
                      ? 'text-[#121614]'
                      : 'text-[#5E6662]'
                  }`}
                >
                  {item.type === 'income' ? '+' : item.type === 'expense' ? '−' : '⌛ '}
                  {formatINR(item.amount)}
                </span>

                <button
                  id={`btn-delete-${item.id}`}
                  onClick={() => {
                    if (item.type === 'income') onDeleteIncome(item.id);
                    else if (item.type === 'expense') onDeleteExpense(item.id);
                    else onDeleteFutureExpense(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8D9691] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                  title="Remove record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
