import React from 'react';
import { FinancialSummary } from '../types';
import { formatINR } from '../utils/finance';
import { ArrowDownRight, ArrowUpRight, CalendarClock, Wallet, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface FinancialSnapshotProps {
  summary: FinancialSummary;
}

export const FinancialSnapshot: React.FC<FinancialSnapshotProps> = ({ summary }) => {
  const isBufferPositive = summary.netBufferAfterUpcoming >= 0;
  const isBalancePositive = summary.recordedBalance >= 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Income Card */}
        <div
          id="stat-card-income"
          className="bg-[#0E151D] border border-[#1E2938] rounded-xl p-3.5 sm:p-4 hover:border-teal-500/30 transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-400">Income</span>
            <div className="w-6 h-6 rounded-md bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono-num tracking-tight">
              {formatINR(summary.effectiveIncome)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              {summary.monthlyRecurringIncome > 0 ? (
                <span className="text-teal-400 font-medium font-mono-num">
                  {formatINR(summary.monthlyRecurringIncome)}/mo
                </span>
              ) : (
                <span>{summary.incomeCount} record{summary.incomeCount === 1 ? '' : 's'}</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Spending Card */}
        <div
          id="stat-card-spending"
          className="bg-[#0E151D] border border-[#1E2938] rounded-xl p-3.5 sm:p-4 hover:border-teal-500/30 transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-400">Spending</span>
            <div className="w-6 h-6 rounded-md bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-300">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono-num tracking-tight">
              {formatINR(summary.totalSpendingRecorded)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>{summary.expenseCount} logged expense{summary.expenseCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        {/* 3. Upcoming Liabilities Card */}
        <div
          id="stat-card-upcoming"
          className="bg-[#0E151D] border border-[#1E2938] rounded-xl p-3.5 sm:p-4 hover:border-teal-500/30 transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-400">Upcoming</span>
            <div className="w-6 h-6 rounded-md bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-cyan-200 font-mono-num tracking-tight">
              {formatINR(summary.totalUpcomingLiabilities)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>{summary.futureExpenseCount} commitment{summary.futureExpenseCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        {/* 4. Recorded Balance Card */}
        <div
          id="stat-card-balance"
          className="bg-[#0D1822] border border-teal-500/40 rounded-xl p-3.5 sm:p-4 shadow-[0_0_20px_rgba(20,184,166,0.06)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-teal-300">Recorded Balance</span>
            <div className="w-6 h-6 rounded-md bg-teal-900/60 border border-teal-500/50 flex items-center justify-center text-teal-300">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className={`text-lg sm:text-xl font-bold font-mono-num tracking-tight ${isBalancePositive ? 'text-teal-300' : 'text-rose-400'}`}>
              {formatINR(summary.recordedBalance)}
            </div>
            <div className="text-[11px] mt-1 flex items-center gap-1">
              <span className="text-slate-400">Buffer after upcoming:</span>
              <span className={`font-mono-num font-medium ${isBufferPositive ? 'text-teal-400' : 'text-amber-400'}`}>
                {formatINR(summary.netBufferAfterUpcoming)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
