import React, { useState } from 'react';
import { ExpenseCategory, IncomeFrequency } from '../types';
import { X, ArrowUpRight, ArrowDownRight, CalendarClock, Plus } from 'lucide-react';

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

  // Escape key listener for immediate interruptibility and safety
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md apple-backdrop-animate transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="modal-manual-entry"
        className="apple-glass-elevated apple-sheet-animate rounded-[28px] w-full max-w-md p-6 sm:p-7 space-y-4 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.05] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <h3 className="text-xs font-semibold text-[#121614] uppercase tracking-wider">
              Direct Record Entry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="apple-press text-[#8D9691] hover:text-[#121614] p-1.5 rounded-full hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Apple iOS Segmented Control */}
        <div className="grid grid-cols-3 gap-1 bg-black/[0.04] p-1 rounded-full border border-black/[0.03]">
          <button
            type="button"
            onClick={() => setEntryType('income')}
            className={`text-xs font-medium py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              entryType === 'income'
                ? 'bg-white text-[#059669] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#5E6662] hover:text-[#121614]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Inflow
          </button>
          <button
            type="button"
            onClick={() => setEntryType('expense')}
            className={`text-xs font-medium py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              entryType === 'expense'
                ? 'bg-white text-[#121614] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#5E6662] hover:text-[#121614]'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            Outflow
          </button>
          <button
            type="button"
            onClick={() => setEntryType('future')}
            className={`text-xs font-medium py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              entryType === 'future'
                ? 'bg-white text-amber-700 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#5E6662] hover:text-[#121614]'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Liability
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-[#5E6662] uppercase tracking-wider mb-1.5">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-[#8D9691] font-mono-num text-xs">₹</span>
              <input
                id="input-manual-amount"
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 30000"
                className="w-full bg-[#F2F4F2]/70 border border-black/[0.06] rounded-2xl pl-8 pr-4 py-2.5 text-[#121614] text-xs font-mono-num focus:outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5E6662] uppercase tracking-wider mb-1.5">
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
                  ? 'e.g. Monthly Salary, Freelance retainer'
                  : entryType === 'expense'
                  ? 'e.g. Dining out, MacBook adapter'
                  : 'e.g. Term deposit, December tuition'
              }
              className="w-full bg-[#F2F4F2]/70 border border-black/[0.06] rounded-2xl px-4 py-2.5 text-[#121614] text-xs focus:outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all shadow-xs"
            />
          </div>

          {entryType === 'income' ? (
            <div>
              <label className="block text-[11px] font-semibold text-[#5E6662] uppercase tracking-wider mb-1.5">
                Frequency Model
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
                className="w-full bg-[#F2F4F2]/70 border border-black/[0.06] rounded-2xl px-4 py-2.5 text-[#121614] text-xs focus:outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all shadow-xs"
              >
                <option value="monthly">Monthly Recurring (Regular Paycheck)</option>
                <option value="one-time">One-Time (Bonus, Freelance)</option>
                <option value="yearly">Yearly (Annual Dividend)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-[#5E6662] uppercase tracking-wider mb-1.5">
                Expense Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-[#F2F4F2]/70 border border-black/[0.06] rounded-2xl px-4 py-2.5 text-[#121614] text-xs focus:outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all shadow-xs"
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
            <label className="block text-[11px] font-semibold text-[#5E6662] uppercase tracking-wider mb-1.5">
              {entryType === 'future' ? 'Target Scheduled Date' : 'Transaction Date'}
            </label>
            <input
              id="input-manual-date"
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g. 2026-10-02 or December"
              className="w-full bg-[#F2F4F2]/70 border border-black/[0.06] rounded-2xl px-4 py-2.5 text-[#121614] text-xs font-mono-num focus:outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all shadow-xs"
            />
          </div>

          <div className="pt-2">
            <button
              id="btn-manual-submit"
              type="submit"
              className="apple-press w-full bg-[#121614] hover:bg-[#202723] text-white font-medium py-3 rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
            >
              <Plus className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Record Financial Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
