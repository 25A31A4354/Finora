import React from 'react';
import { FinancialSummary } from '../types';
import { formatINR } from '../utils/finance';
import { ArrowDownRight, ArrowUpRight, CalendarClock, ShieldCheck, AlertCircle } from 'lucide-react';

interface FinancialSnapshotProps {
  summary: FinancialSummary;
}

export const FinancialSnapshot: React.FC<FinancialSnapshotProps> = ({ summary }) => {
  const isBufferPositive = summary.netBufferAfterUpcoming >= 0;
  const isBalancePositive = summary.recordedBalance >= 0;
  
  // Calculate runway percentage for Apple-style segmented progress bar
  const totalTracked = Math.max(summary.recordedBalance + summary.totalUpcomingLiabilities, 1);
  const bufferPercent = isBufferPositive 
    ? Math.min(Math.round((summary.netBufferAfterUpcoming / totalTracked) * 100), 100) 
    : 0;
  const liabilitiesPercent = Math.min(
    Math.round((summary.totalUpcomingLiabilities / totalTracked) * 100), 
    100 - bufferPercent
  );

  return (
    <section className="w-full" aria-label="Financial Snapshot">
      <div className="apple-glass-card rounded-[28px] p-6 sm:p-9 relative overflow-hidden">
        {/* Subtle Apple Ambient Highlight Gradient */}
        <div 
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{
            background: isBufferPositive 
              ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(255,255,255,0) 70%)'
          }}
        />

        {/* Master Capital Position */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-7 sm:pb-9 border-b border-black/[0.06] relative z-10">
          <div id="stat-card-balance" className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${isBufferPositive ? 'bg-[#059669]' : 'bg-rose-500'}`} />
              <span className="text-[11px] font-semibold tracking-wider text-[#5E6662] uppercase">
                Recorded Liquidity Position
              </span>
              <span className="text-black/20 text-xs" aria-hidden="true">·</span>
              <span className="text-[11px] font-medium text-[#8D9691]">
                Real-Time Verified
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <div
                className={`text-5xl sm:text-6xl lg:text-[72px] font-semibold font-mono-num tracking-tight leading-none ${
                  isBalancePositive ? 'text-[#121614]' : 'text-rose-600'
                }`}
              >
                {formatINR(summary.recordedBalance)}
              </div>
            </div>

            {/* Apple Card Runway Metrics Pill */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.03] border border-black/[0.04]">
                <span className="text-[#5E6662]">Net Buffer:</span>
                <span
                  className={`font-mono-num font-bold text-xs ${
                    isBufferPositive ? 'text-[#059669]' : 'text-rose-600'
                  }`}
                >
                  {formatINR(summary.netBufferAfterUpcoming)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.03] border border-black/[0.04] text-[#5E6662]">
                <CalendarClock className="w-3.5 h-3.5 text-[#8D9691]" />
                <span className="font-mono-num">{formatINR(summary.totalUpcomingLiabilities)} reserved liabilities</span>
              </div>
            </div>
          </div>

          {/* Right Status Capsule */}
          <div className="hidden lg:flex flex-col items-end gap-2">
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
              isBufferPositive 
                ? 'bg-emerald-50 text-[#059669] border border-emerald-100'
                : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {isBufferPositive ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Solvent & Protected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Reserve Attention Needed</span>
                </>
              )}
            </div>
            <div className="text-[11px] font-mono-num text-[#8D9691] text-right">
              {summary.incomeCount + summary.expenseCount + summary.futureExpenseCount} deterministic data points
            </div>
          </div>
        </div>

        {/* Apple Segmented Capital Allocation Bar */}
        {summary.totalSpendingRecorded > 0 || summary.totalUpcomingLiabilities > 0 ? (
          <div className="pt-6 pb-2 border-b border-black/[0.06] relative z-10">
            <div className="flex items-center justify-between text-[11px] text-[#5E6662] mb-2 font-mono-num">
              <span>Capital Runway Distribution</span>
              <span>{bufferPercent}% Unencumbered Buffer</span>
            </div>
            <div className="h-2.5 w-full bg-black/[0.04] rounded-full overflow-hidden flex gap-1 p-0.5">
              <div 
                style={{ width: `${Math.max(bufferPercent, 5)}%` }}
                className="h-full bg-gradient-to-r from-[#059669] to-[#10B981] rounded-full transition-all duration-500"
                title={`Buffer: ${formatINR(summary.netBufferAfterUpcoming)}`}
              />
              {summary.totalUpcomingLiabilities > 0 && (
                <div 
                  style={{ width: `${Math.max(liabilitiesPercent, 5)}%` }}
                  className="h-full bg-[#64748B] rounded-full transition-all duration-500"
                  title={`Upcoming Liabilities: ${formatINR(summary.totalUpcomingLiabilities)}`}
                />
              )}
            </div>
          </div>
        ) : null}

        {/* 3 Apple Sub-Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-7 relative z-10">
          {/* 1. Income Metric */}
          <div id="stat-card-income" className="space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#5E6662] uppercase tracking-wider">
                Total Inflow
              </span>
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100/50">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono-num tracking-tight text-[#121614]">
              {formatINR(summary.effectiveIncome)}
            </div>
            <div className="text-xs font-mono-num text-[#8D9691]">
              {summary.monthlyRecurringIncome > 0 ? (
                <span className="text-[#059669] font-medium">{formatINR(summary.monthlyRecurringIncome)}/mo recurring</span>
              ) : (
                <span>{summary.incomeCount} inflow source{summary.incomeCount === 1 ? '' : 's'}</span>
              )}
            </div>
          </div>

          {/* 2. Spending Metric */}
          <div id="stat-card-spending" className="space-y-2 border-t sm:border-t-0 sm:border-l border-black/[0.06] pt-5 sm:pt-0 sm:pl-8">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#5E6662] uppercase tracking-wider">
                Total Outflow
              </span>
              <div className="w-6 h-6 rounded-full bg-black/[0.04] text-[#5E6662] flex items-center justify-center border border-black/[0.04]">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono-num tracking-tight text-[#121614]">
              {formatINR(summary.totalSpendingRecorded)}
            </div>
            <div className="text-xs font-mono-num text-[#8D9691]">
              <span>{summary.expenseCount} logged transaction{summary.expenseCount === 1 ? '' : 's'}</span>
            </div>
          </div>

          {/* 3. Upcoming Obligations Metric */}
          <div id="stat-card-upcoming" className="space-y-2 border-t sm:border-t-0 sm:border-l border-black/[0.06] pt-5 sm:pt-0 sm:pl-8">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#5E6662] uppercase tracking-wider">
                Scheduled Liabilities
              </span>
              <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100/50">
                <CalendarClock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono-num tracking-tight text-[#121614]">
              {formatINR(summary.totalUpcomingLiabilities)}
            </div>
            <div className="text-xs font-mono-num text-[#8D9691]">
              <span>{summary.futureExpenseCount} planned commitment{summary.futureExpenseCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
