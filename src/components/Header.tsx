import React from 'react';
import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasData }) => {
  return (
    <header className="border-b border-[#1A232F] bg-[#0B1015]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
            <span className="font-bold text-lg tracking-wider">F</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Finora
              </h1>
              <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-800/40">
                AI Memory
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Track your past. See your future. Make better decisions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-[#121922] px-2.5 py-1 rounded-md border border-[#1F2A38]">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Deterministic Math Engine</span>
          </div>

          <div className="flex items-center gap-2">
            {hasData && (
              <button
                id="btn-reset-data"
                onClick={onReset}
                className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-[#141B24] hover:bg-[#1A2430] text-slate-400 hover:text-slate-200 border border-[#232F3E] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear all session records"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
