import React from 'react';
import { CategoryBreakdown } from '../types';
import { formatINR } from '../utils/finance';
import { PieChart, Layers } from 'lucide-react';

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
        className="bg-[#0E151D] border border-[#1E2938] rounded-xl p-4 flex flex-col justify-center items-center text-center py-6"
      >
        <div className="w-8 h-8 rounded-full bg-[#16202C] text-slate-500 flex items-center justify-center mb-2">
          <PieChart className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-semibold text-slate-300">No Spending Logged</h4>
        <p className="text-[11px] text-slate-500 max-w-[220px] mt-0.5">
          Log an expense in chat (e.g. “I spent ₹800 on food today”) to see category analytics.
        </p>
      </div>
    );
  }

  return (
    <div
      id="card-categorical-breakdown"
      className="bg-[#0E151D] border border-[#1E2938] rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-teal-950/60 border border-teal-800/40 flex items-center justify-center text-teal-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Spending Breakdown
            </h3>
            <p className="text-[10px] text-slate-400">
              Categorical distribution of {formatINR(totalSpending)}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono-num font-medium text-slate-300">
          {breakdown.length} categor{breakdown.length === 1 ? 'y' : 'ies'}
        </span>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="h-2 w-full bg-[#16202C] rounded-full overflow-hidden flex gap-0.5 mb-3.5">
        {breakdown.map((item) => (
          <div
            key={item.category}
            style={{
              width: `${Math.max(item.percentage, 2)}%`,
              backgroundColor: item.color,
            }}
            className="h-full rounded-xs transition-all duration-500"
            title={`${item.category}: ${formatINR(item.total)} (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Category Rows */}
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {breakdown.map((item) => (
          <div
            key={item.category}
            className="flex items-center justify-between text-xs group py-0.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 font-medium truncate">
                {item.category}
              </span>
              <span className="text-[10px] text-slate-500 font-mono-num">
                ({item.count})
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-slate-400 text-[11px] font-mono-num">
                {item.percentage}%
              </span>
              <span className="text-white font-mono-num font-semibold text-right min-w-[70px]">
                {formatINR(item.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
