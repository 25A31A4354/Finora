import React from 'react';
import { RotateCcw, Plus, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasData: boolean;
  onOpenAddRecord?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasData, onOpenAddRecord }) => {
  return (
    <header className="sticky top-0 z-30 w-full apple-glass border-b border-black/[0.05] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-4">
        {/* Apple Brand Emblem & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-b from-[#1E2521] to-[#0E1210] text-white flex items-center justify-center font-mono-num font-bold text-sm tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] border border-black/10">
            <Sparkles className="w-4 h-4 text-[#34D399]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold tracking-tight text-[#121614]">
                Finora
              </span>
              <span className="text-black/20 text-xs" aria-hidden="true">/</span>
              <span className="text-[11px] font-medium tracking-wide uppercase text-[#5E6662]">
                Capital Intelligence
              </span>
            </div>
            <p className="text-[11px] text-[#8D9691] hidden sm:block tracking-normal font-normal">
              Continuous Financial Memory & Decision Engine
            </p>
          </div>
        </div>

        {/* Engine status indicator & Apple-style Action Pills */}
        <div className="flex items-center gap-3">
          {/* Live Engine Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.03] border border-black/[0.04] text-[11px] text-[#5E6662] font-mono-num font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
            </span>
            <span>Deterministic Core Active</span>
          </div>

          {onOpenAddRecord && (
            <button
              id="header-btn-add-record"
              onClick={onOpenAddRecord}
              className="apple-press text-xs font-medium px-3.5 py-1.5 rounded-full bg-[#121614] hover:bg-[#202723] text-white flex items-center gap-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Add Record</span>
            </button>
          )}

          {hasData && (
            <button
              id="btn-reset-data"
              onClick={onReset}
              className="apple-press text-xs font-medium px-3 py-1.5 rounded-full bg-black/[0.03] hover:bg-black/[0.06] text-[#5E6662] hover:text-[#121614] border border-black/[0.05] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Clear all session records"
            >
              <RotateCcw className="w-3 h-3 text-[#8D9691]" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
