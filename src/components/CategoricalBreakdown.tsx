import React from 'react';
import { CategoryBreakdown } from '../types';
import { formatINR } from '../utils/finance';
import { PieChart, Sparkles } from 'lucide-react';

interface CategoricalBreakdownProps {
  breakdown: CategoryBreakdown[];
  totalSpending: number;
}

export const CategoricalBreakdown: React.FC<CategoricalBreakdownProps> = ({
  breakdown,
  totalSpending,
}) => {
  if (breakdown.length === 0) {
    return (
      <div
        id="card-categorical-breakdown"
        className="apple-glass-card rounded-[24px] p-6 sm:p-7 flex flex-col justify-center items-center text-center py-10"
      >
        <div className="w-11 h-11 rounded-2xl bg-black/[0.03] border border-black/[0.04] text-[#5E6662] flex items-center justify-center mb-3">
          <PieChart className="w-5 h-5 text-[#8D9691]" />
        </div>
        <h4 className="text-xs font-semibold text-[#121614] tracking-tight">No Spending Analytics Yet</h4>
        <p className="text-[11px] text-[#8D9691] max-w-[240px] mt-1.5 leading-relaxed">
          Log an expense in chat (e.g., “Spent ₹450 on dinner”) to generate Apple-grade allocation metrics.
        </p>
      </div>
    );
  }

  return (
    <div
      id="card-categorical-breakdown"
      className="apple-glass-card rounded-[24px] p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-[#121614] uppercase tracking-wider">
              Category Allocation
            </h3>
            <span className="text-black/20 text-xs" aria-hidden="true">·</span>
            <span className="text-[11px] font-mono-num text-[#5E6662]">
              {breakdown.length} sectors
            </span>
          </div>
          <p className="text-[11px] font-mono-num text-[#8D9691] mt-0.5">
            Total outlays: <span className="text-[#121614] font-semibold">{formatINR(totalSpending)}</span>
          </p>
        </div>
      </div>

      {/* Apple-style Multi-Color Pill Bar */}
      <div className="h-2 w-full bg-black/[0.04] rounded-full overflow-hidden flex gap-0.5 mb-5 p-0.5">
        {breakdown.map((item) => (
          <div
            key={item.category}
            style={{
              width: `${Math.max(item.percentage, 3)}%`,
              backgroundColor: item.color,
            }}
            className="h-full transition-all duration-500 rounded-full"
            title={`${item.category}: ${formatINR(item.total)} (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Category Rows with Apple Wallet pill accents */}
      <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1 divide-y divide-black/[0.03]">
        {breakdown.map((item) => (
          <div
            key={item.category}
            className="flex items-center justify-between text-xs py-2.5 px-2 hover:bg-black/[0.02] rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#121614] font-medium truncate text-xs">
                {item.category}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 font-mono-num">
              <span className="text-[#121614] font-semibold text-right min-w-[70px]">
                {formatINR(item.total)}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/[0.03] text-[#5E6662] text-[10px] font-semibold text-right min-w-[34px]">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
