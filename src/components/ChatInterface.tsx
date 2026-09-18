import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ExtractedFinancialAction, CalculationDetail } from '../types';
import { formatINR } from '../utils/finance';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Calculator
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
      className="bg-[#0B1017] border border-[#1C2634] rounded-xl flex flex-col h-[560px] sm:h-[620px] shadow-sm overflow-hidden"
    >
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-[#1A2330] bg-[#0E151F] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
              Finora Decision Chat
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            </h2>
            <p className="text-[10px] text-slate-400">
              Natural conversation & memory extraction
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1 bg-[#141C26] px-2 py-0.5 rounded border border-[#232F40]">
          <Clock className="w-3 h-3 text-teal-400" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-12 h-12 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-center text-teal-300 mb-3 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
              <Sparkles className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Talk to Finora
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
              Tell me about your income, past spending, or future commitments. I maintain your structured financial snapshot and help you test future purchasing decisions.
            </p>

            {/* Quick Sample Prompts Grid */}
            <div className="w-full max-w-md">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-left">
                Suggested questions to try:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    id={`btn-sample-prompt-${idx}`}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left text-xs p-2.5 rounded-lg bg-[#111822] hover:bg-[#16202D] text-slate-300 hover:text-white border border-[#202C3C] hover:border-teal-500/40 transition-all flex items-start gap-2 cursor-pointer group"
                  >
                    <span className="text-teal-400 group-hover:translate-x-0.5 transition-transform text-xs shrink-0 mt-0.5">
                      ›
                    </span>
                    <span className="leading-snug">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`flex gap-2.5 max-w-[90%] sm:max-w-[80%] ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center text-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#1E293B] text-slate-300 border border-slate-700'
                      : 'bg-teal-950 text-teal-300 border border-teal-600/50'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Content Bubble */}
                <div className="space-y-2">
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-teal-950/80 text-teal-100 border border-teal-600/40 shadow-xs'
                        : 'bg-[#121A24] text-slate-200 border border-[#212D3D]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>

                  {/* Extracted Record Badges */}
                  {msg.extractedActions && msg.extractedActions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {msg.extractedActions.map((action, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0C141C] border border-teal-500/30 rounded-lg p-2 text-xs flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded flex items-center justify-center bg-teal-950 text-teal-300 border border-teal-700/40 shrink-0">
                              {action.type === 'add_income' && (
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              {action.type === 'add_expense' && (
                                <ArrowDownRight className="w-3.5 h-3.5 text-slate-300" />
                              )}
                              {action.type === 'add_future_expense' && (
                                <CalendarClock className="w-3.5 h-3.5 text-cyan-400" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <span className="font-semibold text-white">
                                {action.type === 'add_income'
                                  ? 'Recorded Income'
                                  : action.type === 'add_expense'
                                  ? 'Recorded Expense'
                                  : 'Upcoming Commitment'}
                                :{' '}
                              </span>
                              <span className="text-slate-300">
                                {action.sourceOrDescription}
                              </span>
                              {action.category && (
                                <span className="text-[10px] text-teal-400 bg-teal-950/60 px-1.5 py-0.5 rounded ml-1.5 border border-teal-800/40">
                                  {action.category}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="font-mono-num font-bold text-teal-300 text-xs shrink-0">
                            {formatINR(action.amount)}
                            {action.dateOrFrequency === 'monthly' && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                /mo
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Calculation Details Card (if affordability or wait query was answered) */}
                  {msg.calculationDetails && (
                    <div className="bg-[#0D151E] border border-[#212E3F] rounded-lg p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-[#1A2534] pb-1.5">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5 text-teal-400" />
                          Deterministic Calculation Breakdown
                        </span>
                        {msg.calculationDetails.verdict && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              msg.calculationDetails.verdict === 'AFFORDABLE'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : msg.calculationDetails.verdict === 'TIGHT'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {msg.calculationDetails.verdict.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-num">
                        <div className="text-slate-400">
                          Current Balance:{' '}
                          <span className="text-white font-semibold">
                            {formatINR(msg.calculationDetails.currentBalance)}
                          </span>
                        </div>
                        {msg.calculationDetails.targetAmount && (
                          <div className="text-slate-400">
                            Target Item:{' '}
                            <span className="text-white font-semibold">
                              {formatINR(msg.calculationDetails.targetAmount)}
                            </span>
                          </div>
                        )}
                        <div className="text-slate-400">
                          Upcoming Commitments:{' '}
                          <span className="text-cyan-300 font-semibold">
                            {formatINR(msg.calculationDetails.upcomingDeductions || 0)}
                          </span>
                        </div>
                        {msg.calculationDetails.netBuffer !== undefined && (
                          <div className="text-slate-400">
                            Projected Net Buffer:{' '}
                            <span
                              className={`font-semibold ${
                                msg.calculationDetails.netBuffer >= 0
                                  ? 'text-teal-300'
                                  : 'text-rose-400'
                              }`}
                            >
                              {formatINR(msg.calculationDetails.netBuffer)}
                            </span>
                          </div>
                        )}
                      </div>

                      {msg.calculationDetails.waitMonthsScenario && (
                        <div className="mt-1.5 p-2 bg-[#121A24] rounded border border-[#1E2938] text-[11px]">
                          <span className="text-teal-300 font-semibold">
                            Waiting {msg.calculationDetails.waitMonthsScenario.months} Months:
                          </span>{' '}
                          Adds{' '}
                          <span className="font-mono-num text-emerald-400 font-semibold">
                            +{formatINR(msg.calculationDetails.waitMonthsScenario.projectedIncomeAdded)}
                          </span>{' '}
                          in recurring earnings, resulting in an estimated balance of{' '}
                          <span className="font-mono-num text-teal-300 font-semibold">
                            {formatINR(msg.calculationDetails.waitMonthsScenario.projectedBalanceWithPurchase)}
                          </span>{' '}
                          after purchase & commitments.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-400 pl-1">
            <div className="w-7 h-7 rounded-md bg-teal-950 text-teal-300 border border-teal-600/50 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-[#121A24] border border-[#212D3D] rounded-xl px-3.5 py-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
              <span
                className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
              <span className="text-[11px] text-slate-400 ml-1">Finora is computing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips above input if there are already messages */}
      {messages.length > 0 && (
        <div className="px-4 py-1.5 bg-[#0D141C] border-t border-[#18212C] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
          <span className="text-slate-500 text-[10px] uppercase font-semibold shrink-0">
            Quick Ask:
          </span>
          {SAMPLE_PROMPTS.slice(3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              className="px-2 py-0.5 rounded bg-[#131B24] hover:bg-[#182330] text-slate-300 hover:text-teal-300 border border-[#202C3B] whitespace-nowrap cursor-pointer transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[#0E151F] border-t border-[#1C2634] flex items-center gap-2"
      >
        <input
          ref={inputRef}
          id="chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g. “I earn ₹30,000/mo”, “Spent ₹800 on food”, “Can I afford a ₹40,000 phone?”..."
          disabled={isLoading}
          className="flex-1 bg-[#131B24] text-white placeholder-slate-500 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#232F3E] focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all"
        />
        <button
          id="btn-chat-send"
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600 text-black font-semibold p-2.5 sm:px-4 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <span className="hidden sm:inline text-xs font-bold">Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
