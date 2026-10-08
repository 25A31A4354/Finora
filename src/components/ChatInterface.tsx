import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ExtractedFinancialAction, CalculationDetail } from '../types';
import { formatINR } from '../utils/finance';
import {
  Send,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
  Clock,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const SAMPLE_PROMPTS = [
  "I earn ₹30,000 per month.",
  "I bought a phone for ₹25,000.",
  "I spent ₹800 on food today.",
  "I need to pay ₹70,000 for a laptop in December.",
  "Can I afford a ₹40,000 phone?",
  "What happens if I wait 2 months?",
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handlePromptClick = (promptText: string) => {
    onSendMessage(promptText);
  };

  return (
    <div
      id="chat-interface"
      className="apple-glass-card rounded-[28px] flex flex-col h-[650px] sm:h-[720px] overflow-hidden relative"
    >
      {/* Apple Intelligence Style Titlebar */}
      <div className="px-6 py-4 border-b border-black/[0.05] bg-white/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#059669] shadow-[0_0_8px_rgba(5,150,105,0.6)] animate-pulse" />
          <h2 className="text-xs font-semibold text-[#121614] uppercase tracking-wider">
            Conversational Intelligence & Decision Core
          </h2>
        </div>

        <div className="text-[11px] font-mono-num text-[#8D9691] flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/[0.03]">
          <Clock className="w-3 h-3 text-[#5E6662]" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-white to-[#F2F4F2] text-[#059669] flex items-center justify-center mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] border border-black/[0.05]">
              <Sparkles className="w-6 h-6 text-[#059669]" />
            </div>
            
            <h3 className="text-2xl font-semibold text-[#121614] mb-2 tracking-tight">
              Finora Capital Intelligence
            </h3>
            
            <p className="text-xs sm:text-sm text-[#5E6662] max-w-md mb-8 leading-relaxed font-normal">
              Speak naturally about your income, daily spend, or future commitments. Finora builds your financial memory and stress-tests decisions with deterministic precision.
            </p>

            {/* Apple Style Suggested Queries */}
            <div className="w-full max-w-lg">
              <div className="text-[11px] font-semibold text-[#8D9691] uppercase tracking-wider mb-2.5 text-left flex items-center justify-between">
                <span>Suggested inquiries</span>
                <span className="text-[10px] font-mono-num text-[#8D9691]">Tap to simulate</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    id={`btn-sample-prompt-${idx}`}
                    onClick={() => handlePromptClick(prompt)}
                    className="apple-press apple-hint-parent text-left text-xs p-3.5 rounded-2xl bg-white hover:bg-[#F8F9F8] text-[#5E6662] hover:text-[#121614] border border-black/[0.06] hover:border-black/[0.12] transition-all flex items-start justify-between gap-2.5 cursor-pointer group shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <span className="leading-snug font-medium">{prompt}</span>
                    <ArrowRight className="apple-hint-child w-3.5 h-3.5 text-[#8D9691] group-hover:text-[#059669] shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col animate-[appleSheetEnter_0.35s_var(--spring-smooth)] ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`flex flex-col max-w-[94%] sm:max-w-[88%] space-y-2 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Sender badge */}
                <div className="flex items-center gap-1.5 px-1">
                  {msg.sender === 'user' ? (
                    <span className="text-[10px] font-mono-num font-semibold text-[#8D9691] uppercase tracking-wider">
                      You
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                      <span className="text-[10px] font-mono-num font-bold text-[#059669] uppercase tracking-wider">
                        Finora
                      </span>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div
                  className={`rounded-2xl px-4.5 py-3 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#121614] text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-tr-xs'
                      : 'bg-white/80 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-tl-xs text-[#121614]'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-normal">{msg.text}</div>
                </div>

                {/* Apple Wallet Transaction Confirmation Slips */}
                {msg.extractedActions && msg.extractedActions.length > 0 && (
                  <div className="w-full space-y-2 pt-1">
                    {msg.extractedActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-black/[0.06] rounded-xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            action.type === 'add_income'
                              ? 'bg-emerald-50 text-[#059669] border-emerald-100'
                              : action.type === 'add_expense'
                              ? 'bg-black/[0.03] text-[#121614] border-black/[0.05]'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {action.type === 'add_income' && (
                              <ArrowUpRight className="w-4 h-4 text-[#059669]" />
                            )}
                            {action.type === 'add_expense' && (
                              <ArrowDownRight className="w-4 h-4 text-[#121614]" />
                            )}
                            {action.type === 'add_future_expense' && (
                              <CalendarClock className="w-4 h-4 text-amber-700" />
                            )}
                          </span>
                          
                          <div className="min-w-0 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono-num text-[10px] font-semibold text-[#5E6662] uppercase tracking-wider">
                                {action.type === 'add_income'
                                  ? 'Inflow Logged'
                                  : action.type === 'add_expense'
                                  ? 'Outflow Registered'
                                  : 'Liabilities Scheduled'}
                              </span>
                              {action.category && (
                                <>
                                  <span className="text-black/20" aria-hidden="true">·</span>
                                  <span className="text-[11px] text-[#5E6662]">
                                    {action.category}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="text-[#121614] font-medium truncate mt-0.5">
                              {action.sourceOrDescription}
                            </div>
                          </div>
                        </div>

                        <div className="font-mono-num font-semibold text-sm shrink-0 flex items-center gap-1 self-end sm:self-center">
                          <span className={action.type === 'add_income' ? 'text-[#059669]' : 'text-[#121614]'}>
                            {action.type === 'add_income' ? '+' : action.type === 'add_expense' ? '−' : '⌛ '}
                            {formatINR(action.amount)}
                          </span>
                          {action.dateOrFrequency === 'monthly' && (
                            <span className="text-[11px] text-[#8D9691] font-normal">
                              /mo
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Apple Card Style Decision Simulator Pass */}
                {msg.calculationDetails && (
                  <div className="w-full bg-white border border-black/[0.06] rounded-2xl p-4 sm:p-5 text-xs space-y-4 mt-2 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                    {/* Header & Verdict */}
                    <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
                      <div>
                        <span className="text-[11px] font-semibold text-[#5E6662] uppercase tracking-wider block">
                          Purchasing Decision Assessment
                        </span>
                        <span className="text-[10px] text-[#8D9691] font-mono-num">
                          Deterministic Capital Evaluation
                        </span>
                      </div>

                      {msg.calculationDetails.verdict && (
                        <div className="flex items-center gap-1.5">
                          {msg.calculationDetails.verdict === 'AFFORDABLE' ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider text-[#059669] bg-emerald-50 border border-emerald-200/60 shadow-xs">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                              Affordable
                            </span>
                          ) : msg.calculationDetails.verdict === 'TIGHT' ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 shadow-xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                              Tight Reserve
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 shadow-xs">
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-700" />
                              Unsafe
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Step Breakdown Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-1">
                      {/* 1. Current Position */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono-num text-[#8D9691] uppercase tracking-wider">
                          Current Position
                        </div>
                        <div className="text-sm font-semibold font-mono-num text-[#121614]">
                          {formatINR(msg.calculationDetails.currentBalance)}
                        </div>
                      </div>

                      {/* 2. Target Cost */}
                      {msg.calculationDetails.targetAmount !== undefined && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono-num text-[#8D9691] uppercase tracking-wider truncate">
                            Item Outlay
                          </div>
                          <div className="text-sm font-semibold font-mono-num text-[#121614]">
                            − {formatINR(msg.calculationDetails.targetAmount)}
                          </div>
                        </div>
                      )}

                      {/* 3. Upcoming Obligations */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono-num text-[#8D9691] uppercase tracking-wider truncate">
                          Reserved Liabilities
                        </div>
                        <div className="text-sm font-semibold font-mono-num text-[#5E6662]">
                          {formatINR(msg.calculationDetails.upcomingDeductions || 0)}
                        </div>
                      </div>

                      {/* 4. Retained Buffer */}
                      {msg.calculationDetails.netBuffer !== undefined && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono-num text-[#8D9691] uppercase tracking-wider">
                            Retained Cushion
                          </div>
                          <div
                            className={`text-sm font-bold font-mono-num ${
                              msg.calculationDetails.netBuffer >= 0
                                ? 'text-[#059669]'
                                : 'text-rose-600'
                            }`}
                          >
                            {formatINR(msg.calculationDetails.netBuffer)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Buy Now vs Wait Scenario Comparison */}
                    {msg.calculationDetails.waitMonthsScenario && (
                      <div className="mt-2 p-3.5 bg-black/[0.02] rounded-xl border border-black/[0.05] text-xs space-y-2">
                        <div className="text-[11px] font-semibold text-[#121614] uppercase tracking-wider">
                          Scenario Comparison: Buy Now vs. Wait {msg.calculationDetails.waitMonthsScenario.months} Months
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="bg-white p-3 rounded-xl border border-black/[0.05] shadow-xs">
                            <div className="text-[10px] font-mono-num text-[#8D9691] uppercase tracking-wider">
                              Option A: Transact Now
                            </div>
                            <div className="text-xs font-semibold font-mono-num text-[#121614] mt-1">
                              Post-Purchase Cushion: {formatINR(msg.calculationDetails.netBuffer || 0)}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-xs">
                            <div className="text-[10px] font-mono-num text-[#059669] font-semibold uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                              Option B: Wait {msg.calculationDetails.waitMonthsScenario.months} Months
                            </div>
                            <div className="text-xs font-semibold font-mono-num text-[#121614] mt-1">
                              Projected Buffer: {formatINR(msg.calculationDetails.waitMonthsScenario.projectedBalanceWithPurchase)}
                            </div>
                            <div className="text-[10px] text-[#5E6662] mt-0.5 font-mono-num">
                              (+{formatINR(msg.calculationDetails.waitMonthsScenario.projectedIncomeAdded)} recurring cash)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Pulse */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1.5 pl-1">
            <div className="flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              <span className="text-[10px] font-mono-num font-bold text-[#059669] uppercase tracking-wider">
                Finora
              </span>
            </div>
            <div className="bg-white border border-black/[0.06] rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-bounce" />
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
              <span className="text-xs font-mono-num text-[#5E6662] ml-1">
                Synthesizing financial memory & calculations...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries (When conversation is active) */}
      {messages.length > 0 && (
        <div className="px-5 py-2.5 bg-white/70 backdrop-blur-md border-t border-black/[0.05] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[#8D9691] text-[10px] font-semibold uppercase tracking-wider shrink-0">
            Suggested →
          </span>
          <button
            onClick={() => handlePromptClick("Can I afford a ₹40,000 phone?")}
            className="apple-press px-3 py-1 rounded-full bg-white hover:bg-[#F8F9F8] text-[#5E6662] hover:text-[#121614] border border-black/[0.06] whitespace-nowrap cursor-pointer transition-colors text-xs font-medium shadow-xs"
          >
            Can I afford a ₹40,000 phone?
          </button>
          <button
            onClick={() => handlePromptClick("What happens if I wait 2 months?")}
            className="apple-press px-3 py-1 rounded-full bg-white hover:bg-[#F8F9F8] text-[#5E6662] hover:text-[#121614] border border-black/[0.06] whitespace-nowrap cursor-pointer transition-colors text-xs font-medium shadow-xs"
          >
            What happens if I wait 2 months?
          </button>
          <button
            onClick={() => handlePromptClick("What are my upcoming commitments?")}
            className="apple-press px-3 py-1 rounded-full bg-white hover:bg-[#F8F9F8] text-[#5E6662] hover:text-[#121614] border border-black/[0.06] whitespace-nowrap cursor-pointer transition-colors text-xs font-medium shadow-xs"
          >
            What are my upcoming commitments?
          </button>
        </div>
      )}

      {/* Apple Pill Input Container */}
      <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-md border-t border-black/[0.05]">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              id="chat-input-field"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell Finora about your money (e.g., “Spent ₹450 on food”, “Can I afford a ₹40,000 laptop?”)…"
              disabled={isLoading}
              className="w-full bg-[#F2F4F2]/70 text-[#121614] placeholder-[#8D9691] text-xs sm:text-sm px-4.5 py-3 rounded-full border border-black/[0.06] focus:outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all font-sans shadow-xs"
            />
          </div>
          <button
            id="btn-chat-send"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="apple-press bg-[#121614] hover:bg-[#202723] disabled:opacity-30 disabled:hover:bg-[#121614] text-white font-medium px-4 py-3 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          >
            <span className="hidden sm:inline text-xs uppercase tracking-wider font-semibold">Send</span>
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </form>

        {/* Micro suggestion pills */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 px-2 text-[11px] text-[#8D9691]">
          <span>Quick log:</span>
          <button
            type="button"
            onClick={() => handlePromptClick("Spent ₹500 on food")}
            className="hover:text-[#059669] transition-colors cursor-pointer"
          >
            “Spent ₹500 on food”
          </button>
          <span className="text-black/20">·</span>
          <button
            type="button"
            onClick={() => handlePromptClick("Salary ₹30,000 per month")}
            className="hover:text-[#059669] transition-colors cursor-pointer"
          >
            “Salary ₹30,000/mo”
          </button>
          <span className="text-black/20">·</span>
          <button
            type="button"
            onClick={() => handlePromptClick("College fees ₹12,000 next month")}
            className="hover:text-[#059669] transition-colors cursor-pointer"
          >
            “College fees ₹12,000 next month”
          </button>
        </div>
      </div>
    </div>
  );
};
