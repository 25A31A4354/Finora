import React, { useState } from 'react';
import { ExpenseCategory, IncomeFrequency } from '../types';
import { X, Plus, ArrowUpRight, ArrowDownRight, CalendarClock } from 'lucide-react';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome: (amount: number, source: string, frequency: IncomeFrequency, date: string) => void;
  onAddExpense: (amount: number, description: string, category: ExpenseCategory, date: string) => void;
  onAddFutureExpense: (amount: number, description: string, category: ExpenseCategory, expectedDate: string) => void;
}

const CATEGORIES: ExpenseCategory[] = [
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

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onAddIncome,
  onAddExpense,
  onAddFutureExpense,
}) => {
  const [entryType, setEntryType] = useState<'income' | 'expense' | 'future'>('expense');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Shopping & Gadgets');
  const [frequency, setFrequency] = useState<IncomeFrequency>('monthly');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !name.trim()) return;

    if (entryType === 'income') {
      onAddIncome(numAmount, name.trim(), frequency, date);
    } else if (entryType === 'expense') {
      onAddExpense(numAmount, name.trim(), category, date);
    } else {
      onAddFutureExpense(numAmount, name.trim(), category, date);
    }

    setAmount('');
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        id="modal-manual-entry"
        className="bg-[#0E151E] border border-[#222E3E] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#1C2634] pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-400" />
            Add Financial Record Directly
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#131B24] p-1 rounded-lg border border-[#202C3C]">
          <button
            type="button"
            onClick={() => setEntryType('income')}
            className={`text-xs font-semibold py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              entryType === 'income'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Income
          </button>
          <button
            type="button"
            onClick={() => setEntryType('expense')}
            className={`text-xs font-semibold py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              entryType === 'expense'
                ? 'bg-slate-800 text-slate-200 border border-slate-600 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setEntryType('future')}
            className={`text-xs font-semibold py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              entryType === 'future'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Future
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-mono-num text-xs">₹</span>
              <input
                id="input-manual-amount"
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 30000"
                className="w-full bg-[#131B24] border border-[#232F40] rounded-lg pl-8 pr-3 py-2 text-white text-xs font-mono-num focus:outline-none focus:border-teal-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              {entryType === 'income' ? 'Income Source / Title' : 'Description / Item'}
            </label>
            <input
              id="input-manual-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                entryType === 'income'
                  ? 'e.g. Monthly Salary, Freelance project'
                  : entryType === 'expense'
                  ? 'e.g. Groceries, Phone purchase'
                  : 'e.g. Laptop replacement, December rent'
              }
              className="w-full bg-[#131B24] border border-[#232F40] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500/60"
            />
          </div>

          {entryType === 'income' ? (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
                className="w-full bg-[#131B24] border border-[#232F40] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500/60"
              >
                <option value="monthly">Monthly Recurring</option>
                <option value="one-time">One-Time</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-[#131B24] border border-[#232F40] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500/60"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              {entryType === 'future' ? 'Target Expected Date / Timeframe' : 'Date'}
            </label>
            <input
              id="input-manual-date"
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g. 2026-12-15 or December 2026"
              className="w-full bg-[#131B24] border border-[#232F40] rounded-lg px-3 py-2 text-white text-xs font-mono-num focus:outline-none focus:border-teal-500/60"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1C2634]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-manual-submit"
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-black transition-colors cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
