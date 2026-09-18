import React, { useState } from 'react';
import {
  IncomeRecord,
  ExpenseRecord,
  FutureExpenseRecord,
} from '../types';
import { formatINR } from '../utils/finance';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Trash2,
  ListFilter,
  Inbox
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

  // Unify activity items
  const allItems = [
    ...incomes.map((i) => ({
      id: i.id,
      type: 'income' as const,
      title: i.source,
      amount: i.amount,
      tag: i.frequency === 'monthly' ? 'Monthly Income' : 'Income',
      date: i.date,
      createdAt: i.createdAt,
      onDelete: () => onDeleteIncome(i.id),
    })),
    ...expenses.map((e) => ({
      id: e.id,
      type: 'expense' as const,
      title: e.description,
      amount: e.amount,
      tag: e.category,
      date: e.date,
      createdAt: e.createdAt,
      onDelete: () => onDeleteExpense(e.id),
    })),
    ...futureExpenses.map((f) => ({
      id: f.id,
      type: 'future' as const,
      title: f.description,
      amount: f.amount,
      tag: `${f.category} • Due ${f.expectedDate}`,
      date: f.expectedDate,
      createdAt: f.createdAt,
      onDelete: () => onDeleteFutureExpense(f.id),
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  const filteredItems = allItems.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'income') return item.type === 'income';
    if (activeTab === 'spending') return item.type === 'expense';
    if (activeTab === 'upcoming') return item.type === 'future';
    return true;
  });

  return (
    <div
      id="card-recent-activity"
      className="bg-[#0E151D] border border-[#1E2938] rounded-xl p-4 flex flex-col h-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-teal-950/60 border border-teal-800/40 flex items-center justify-center text-teal-400">
            <ListFilter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Financial Memory Log
            </h3>
            <p className="text-[10px] text-slate-400">
              {allItems.length} total records stored in session
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#131B24] p-0.5 rounded-lg border border-[#222E3E] self-start sm:self-auto">
          {(['all', 'income', 'spending', 'upcoming'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer capitalize ${
                activeTab === tab
                  ? 'bg-teal-950 text-teal-300 border border-teal-700/50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[340px] pr-1 min-h-[140px]">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-9 h-9 rounded-full bg-[#16212D] flex items-center justify-center mb-2">
              <Inbox className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs font-medium text-slate-300">
              No {activeTab !== 'all' ? activeTab : ''} records yet
            </p>
            <p className="text-[11px] text-slate-500 max-w-[240px] mt-0.5">
              Chat naturally to add records (e.g. “I earn ₹30,000/mo”, “Spent ₹800 on food”, or “₹70,000 laptop in Dec”).
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-[#121922] hover:bg-[#151F2B] border border-[#1C2634] hover:border-slate-700/60 rounded-lg p-2.5 flex items-center justify-between gap-3 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    item.type === 'income'
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                      : item.type === 'expense'
                      ? 'bg-slate-800/70 text-slate-300 border border-slate-700/50'
                      : 'bg-cyan-950/70 text-cyan-400 border border-cyan-800/40'
                  }`}
                >
                  {item.type === 'income' && <ArrowUpRight className="w-4 h-4" />}
                  {item.type === 'expense' && <ArrowDownRight className="w-4 h-4" />}
                  {item.type === 'future' && <CalendarClock className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                    <span className="truncate">{item.tag}</span>
                    <span className="text-slate-600">•</span>
                    <span className="shrink-0">{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs font-bold font-mono-num ${
                    item.type === 'income'
                      ? 'text-emerald-400'
                      : item.type === 'expense'
                      ? 'text-slate-200'
                      : 'text-cyan-300'
                  }`}
                >
                  {item.type === 'income' ? '+' : item.type === 'expense' ? '-' : '⌛ '}
                  {formatINR(item.amount)}
                </span>

                <button
                  id={`btn-delete-${item.id}`}
                  onClick={item.onDelete}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity cursor-pointer"
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
