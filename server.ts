import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize Gemini SDK lazily
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Format INR helper for server-side prompts and deterministic calculations
function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(absAmount);
  return isNegative ? `-${formatted}` : formatted;
}

const VALID_CATEGORIES = [
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

function normalizeCategory(categoryStr?: string, description?: string): string {
  if (categoryStr) {
    const trimmed = categoryStr.trim();
    const exact = VALID_CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exact) return exact;
  }

  const text = `${categoryStr || ''} ${description || ''}`.toLowerCase();

  if (/food|dine|dining|restaurant|cafe|coffee|tea|biscuit|snack|grocer|meal|swiggy|zomato|burger|pizza|bread|milk|lunch|dinner|breakfast/i.test(text)) {
    return 'Food & Dining';
  }
  if (/utilit|bill|electric|power|water|gas|wifi|internet|broadband|recharge|mobile bill|phone bill|maintenance|maid|cook|clean/i.test(text)) {
    return 'Utilities & Bills';
  }
  if (/phone|mobile|laptop|macbook|computer|ipad|tablet|headphone|airpod|gadget|electronic|cloth|shirt|pant|shoe|watch|shopping|amazon|flipkart|myntra|zara|apparel|dress/i.test(text)) {
    return 'Shopping & Gadgets';
  }
  if (/rent|lease|mortgage|flat|apartment|house|room|hostel|pg|deposit/i.test(text)) {
    return 'Housing & Rent';
  }
  if (/fuel|petrol|diesel|gasoline|uber|ola|auto|cab|taxi|metro|bus|train|railway|fare|toll|flight|parking/i.test(text)) {
    return 'Transport & Fuel';
  }
  if (/college|school|fee|fees|tuition|course|book|exam|university|class|education|training|coaching/i.test(text)) {
    return 'Education';
  }
  if (/medic|doctor|hospital|clinic|pharmacy|pill|health|dental|dentist|lab|test|checkup/i.test(text)) {
    return 'Healthcare';
  }
  if (/movie|cinema|film|theatre|netflix|prime|hotstar|spotify|concert|show|event|party|club|game|gaming|steam/i.test(text)) {
    return 'Entertainment';
  }
  if (/trip|tour|vacation|flight|hotel|resort|airbnb|travel|sightseeing/i.test(text)) {
    return 'Travel';
  }
  if (/salon|haircut|spa|massage|gym|fitness|yoga|grooming|cosmetic|makeup/i.test(text)) {
    return 'Personal Care';
  }

  return 'Other';
}

function parseAmount(text: string): number {
  // Matches currency marked amounts: ₹ 10,000 | ₹10 | 10 rupees | 10 rs | 10rs | rs 10 | inr 10
  const currencyMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i)
    || text.match(/([\d,]+(?:\.\d+)?)\s*(?:rupees|rupee|rs\.?|inr)/i);
  if (currencyMatch) {
    const clean = currencyMatch[1].replace(/,/g, '');
    const num = parseFloat(clean);
    if (!isNaN(num) && num > 0) return num;
  }

  // Standalone numbers: 70000, 25000, 450, 10
  const numMatch = text.match(/\b([\d,]+(?:\.\d+)?)\b/);
  if (numMatch) {
    const clean = numMatch[1].replace(/,/g, '');
    const num = parseFloat(clean);
    if (!isNaN(num) && num > 0) return num;
  }
  return 0;
}

// Fallback rule-based parser in case API key is missing, offline, or returns empty extraction
function fallbackRuleBasedExtractor(message: string, financialState: any) {
  const lower = message.toLowerCase().trim();
  const actions: any[] = [];
  let reply = "";

  // 1. Wait query (e.g. "What happens if I wait 2 months?")
  const waitMatch = lower.match(/what happens if i wait\s*(\d+)?\s*month/i);
  if (waitMatch) {
    const months = parseInt(waitMatch[1] || "2", 10) || 2;
    const monthlyInc = Number(financialState?.summary?.monthlyRecurringIncome || 0);
    const balance = Number(financialState?.summary?.recordedBalance || 0);
    const upcoming = Number(financialState?.summary?.totalUpcomingLiabilities || 0);
    const addedIncome = monthlyInc * months;
    const projectedWithout = balance + addedIncome;
    const projectedWithUpcoming = projectedWithout - upcoming;

    reply = `If you wait ${months} month${months > 1 ? 's' : ''}:\n\n` +
      `• Projected income accumulated: ${formatINR(addedIncome)} (${formatINR(monthlyInc)}/mo × ${months})\n` +
      `• Gross projected balance: ${formatINR(projectedWithout)}\n` +
      `• Upcoming commitments scheduled: ${formatINR(upcoming)}\n` +
      `• Net projected liquidity: ${formatINR(projectedWithUpcoming)}\n\n` +
      `Waiting provides a significantly safer cash cushion before making large discretionary purchases.`;

    return { extractedActions: [], reply, requiresClarification: false };
  }

  // 2. Affordability query (e.g. "Can I afford a ₹40,000 phone?")
  const affordMatch = lower.match(/(?:can i afford|should i buy|can we afford|is it safe to buy)\s*(?:a|an)?\s*(.+)/i);
  if (affordMatch) {
    const queryPart = affordMatch[1];
    const amount = parseAmount(queryPart);
    const item = queryPart
      .replace(/(?:₹|rs\.?|inr)\s*[\d,]+(?:\.\d+)?/gi, '')
      .replace(/[\d,]+(?:\.\d+)?\s*(?:rupees|rupee|rs\.?|inr)?/gi, '')
      .replace(/[?.,!]/g, '')
      .trim() || 'item';

    const balance = Number(financialState?.summary?.recordedBalance || 0);
    const upcoming = Number(financialState?.summary?.totalUpcomingLiabilities || 0);
    const postBalance = balance - amount;
    const netBuffer = postBalance - upcoming;

    if (amount > balance) {
      reply = `You currently have a recorded balance of ${formatINR(balance)}. Buying ${item} for ${formatINR(amount)} requires ${formatINR(amount - balance)} more than your current funds. Waiting for upcoming monthly income is recommended.`;
    } else if (netBuffer < 0) {
      reply = `You have ${formatINR(balance)}, which numerically covers the ${formatINR(amount)} for ${item}. However, you have ${formatINR(upcoming)} in upcoming commitments, leaving a deficit of ${formatINR(Math.abs(netBuffer))}. It is safer to wait or defer.`;
    } else {
      reply = `With your current recorded balance of ${formatINR(balance)}, purchasing ${item} for ${formatINR(amount)} leaves ${formatINR(postBalance)}. Reserving ${formatINR(upcoming)} for upcoming commitments leaves a healthy safety buffer of ${formatINR(netBuffer)}.`;
    }

    return { extractedActions: [], reply, requiresClarification: false };
  }

  // Relative or stated date detection
  let statedDate = new Date().toISOString().split('T')[0];
  if (/\byesterday\b/i.test(lower)) {
    const d = new Date(Date.now() - 86400000);
    statedDate = d.toISOString().split('T')[0];
  } else if (/\btomorrow\b/i.test(lower)) {
    statedDate = 'Tomorrow';
  } else if (/\bnext month\b/i.test(lower)) {
    statedDate = 'Next month';
  } else {
    const monthMatch = lower.match(/\b(in\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
    if (monthMatch) {
      statedDate = monthMatch[2].charAt(0).toUpperCase() + monthMatch[2].slice(1).toLowerCase();
    }
  }

  // 3. Future commitments:
  // "I need to pay ₹70,000 college fees in December", "I’m planning to buy a laptop for 70000 next month", "I will buy a biscuit for ₹10 tomorrow"
  const isFuture = /(?:need to pay|have to pay|planning to (?:buy|spend|pay)|will buy|will pay|going to buy|must pay|scheduled to pay|upcoming commitment)/i.test(lower)
    || (/(?:buy|pay|spend)/i.test(lower) && /(?:next month|tomorrow|in \w+|later)/i.test(lower));

  if (isFuture) {
    const amount = parseAmount(message);
    if (amount > 0) {
      let desc = message
        .replace(/(?:i['’]m|i am|i|we)\s+(?:need to pay|have to pay|planning to (?:buy|spend|pay)|will buy|will pay|going to buy|must pay|scheduled to pay)/gi, '')
        .replace(/(?:in\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december|next month|tomorrow|later)/gi, '')
        .replace(/(?:₹|rs\.?|inr)\s*[\d,]+(?:\.\d+)?/gi, '')
        .replace(/[\d,]+(?:\.\d+)?\s*(?:rupees|rupee|rs\.?|inr)?/gi, '')
        .replace(/\b(?:for|on|costing|a|an|the)\b/gi, '')
        .replace(/[.,!]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!desc) desc = 'Future commitment';
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
      const category = normalizeCategory(undefined, desc);

      actions.push({
        actionType: 'add_future_expense',
        amount,
        sourceOrDescription: desc,
        category,
        frequency: 'one-time',
        dateOrExpectedDate: statedDate === new Date().toISOString().split('T')[0] ? 'Upcoming' : statedDate,
      });

      reply = `I have logged an upcoming commitment of ${formatINR(amount)} for "${desc}" (${category}) scheduled for ${statedDate}. This amount is reserved in your future liabilities.`;
      return { extractedActions: actions, reply, requiresClarification: false };
    }
  }

  // 4. Income:
  // "I earn ₹30,000 per month", "I received ₹30,000 salary", "My salary is ₹30,000 per month", "I received ₹1,500 from freelancing"
  const isIncome = /(?:earn|salary|received|got paid|credited|stipend|bonus|freelancing|pocket money)\b/i.test(lower)
    || (lower.includes('income') && !lower.includes('tax'));

  if (isIncome) {
    const amount = parseAmount(message);
    if (amount > 0) {
      const isMonthly = /(?:per month|\/mo|\/month|every month|monthly|p\.?m\.?)\b/i.test(lower);
      let source = 'Income';
      if (/freelanc/i.test(lower)) source = 'Freelancing';
      else if (/salary/i.test(lower)) source = 'Salary';
      else if (/bonus/i.test(lower)) source = 'Bonus';
      else if (/stipend/i.test(lower)) source = 'Stipend';
      else if (/dividend|interest/i.test(lower)) source = 'Investments';
      else if (/client/i.test(lower)) source = 'Client Work';
      else if (isMonthly) source = 'Monthly Salary';

      actions.push({
        actionType: 'add_income',
        amount,
        sourceOrDescription: source,
        category: 'Income',
        frequency: isMonthly ? 'monthly' : 'one-time',
        dateOrExpectedDate: statedDate,
      });

      reply = `Recorded ${isMonthly ? 'monthly recurring' : 'one-time'} income of ${formatINR(amount)} from "${source}". Your recorded balance and financial snapshot have been updated immediately.`;
      return { extractedActions: actions, reply, requiresClarification: false };
    }
  }

  // 5. Past / Current Expense:
  // "I bought a biscuit for ₹10", "I spent 10 rupees on biscuits", "I paid ₹450 for electricity", "I bought a ₹25,000 phone", "Yesterday I spent ₹120 on snacks", "I spent ₹73 on tea and snacks", "I paid ₹900 for electricity yesterday"
  const isExpense = /(?:spent|bought|paid|purchased|spend)\b/i.test(lower);
  if (isExpense) {
    const amount = parseAmount(message);
    if (amount > 0) {
      let desc = message
        .replace(/\b(?:yesterday|today)\b/gi, '')
        .replace(/(?:i|we)\s+(?:spent|bought|paid|purchased|spend)\b/gi, '')
        .replace(/(?:₹|rs\.?|inr)\s*[\d,]+(?:\.\d+)?/gi, '')
        .replace(/[\d,]+(?:\.\d+)?\s*(?:rupees|rupee|rs\.?|inr)?/gi, '')
        .replace(/\b(?:for|on|costing|a|an|the)\b/gi, '')
        .replace(/[.,!]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!desc) desc = 'Expense';
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
      const category = normalizeCategory(undefined, desc);

      actions.push({
        actionType: 'add_expense',
        amount,
        sourceOrDescription: desc,
        category,
        frequency: 'one-time',
        dateOrExpectedDate: statedDate,
      });

      reply = `Recorded spending of ${formatINR(amount)} for "${desc}" under ${category} (${statedDate}). Your spending snapshot and recorded balance have been updated.`;
      return { extractedActions: actions, reply, requiresClarification: false };
    }
  }

  // 6. Generic amount fallback if user provided an amount with item
  const fallbackAmount = parseAmount(message);
  if (fallbackAmount > 0) {
    let desc = message
      .replace(/(?:₹|rs\.?|inr)\s*[\d,]+(?:\.\d+)?/gi, '')
      .replace(/[\d,]+(?:\.\d+)?\s*(?:rupees|rupee|rs\.?|inr)?/gi, '')
      .replace(/\b(?:a|an|the|for|on)\b/gi, '')
      .replace(/[.,!]/g, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Expense';
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    const category = normalizeCategory(undefined, desc);

    actions.push({
      actionType: 'add_expense',
      amount: fallbackAmount,
      sourceOrDescription: desc,
      category,
      frequency: 'one-time',
      dateOrExpectedDate: statedDate,
    });
    reply = `Recorded spending of ${formatINR(fallbackAmount)} for "${desc}" under ${category}.`;
    return { extractedActions: actions, reply, requiresClarification: false };
  }

  reply = `I am Finora, your financial memory and decision assistant. You can log income ("I earn ₹30,000 per month"), record spending ("I bought a biscuit for ₹10", "I paid ₹450 for electricity"), schedule upcoming commitments ("I need to pay ₹70,000 for college fees next month"), or test future purchases ("Can I afford a ₹40,000 phone?").`;
  return { extractedActions: [], reply, requiresClarification: false };
}

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [], financialState = {} } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message string is required." });
    }

    const ai = getGeminiClient();

    // Prepare deterministic context from application engine state
    const summary = financialState.summary || {};
    const incomes = financialState.incomes || [];
    const expenses = financialState.expenses || [];
    const futureExpenses = financialState.futureExpenses || [];

    const financialContext = `
CURRENT STORED FINANCIAL DATA (DERIVED STRICTLY FROM USER-ENTERED RECORDS):
- Monthly Recurring Income: ${formatINR(summary.monthlyRecurringIncome || 0)}
- Total One-Time Income: ${formatINR((summary.totalIncomeRecorded || 0) - (summary.monthlyRecurringIncome || 0))}
- Effective Recorded Income: ${formatINR(summary.effectiveIncome || 0)}
- Total Recorded Past Spending: ${formatINR(summary.totalSpendingRecorded || 0)}
- Current Recorded Balance: ${formatINR(summary.recordedBalance || 0)}
- Total Upcoming Liabilities: ${formatINR(summary.totalUpcomingLiabilities || 0)}
- Net Remaining Buffer (Balance - Upcoming): ${formatINR(summary.netBufferAfterUpcoming || 0)}

STORED INCOME RECORDS (${incomes.length}):
${incomes.length ? incomes.map((i: any) => `- ${i.source}: ${formatINR(i.amount)} (${i.frequency}) on ${i.date}`).join('\n') : '(None recorded yet)'}

STORED EXPENSE RECORDS (${expenses.length}):
${expenses.length ? expenses.map((e: any) => `- ${e.description}: ${formatINR(e.amount)} [${e.category}] on ${e.date}`).join('\n') : '(None recorded yet)'}

STORED FUTURE COMMITMENTS (${futureExpenses.length}):
${futureExpenses.length ? futureExpenses.map((f: any) => `- ${f.description}: ${formatINR(f.amount)} [${f.category}] expected ${f.expectedDate}`).join('\n') : '(None recorded yet)'}

CATEGORICAL BREAKDOWN:
${summary.categoryBreakdown?.length ? summary.categoryBreakdown.map((c: any) => `- ${c.category}: ${formatINR(c.total)} (${c.percentage}%)`).join('\n') : '(No expenses recorded yet)'}
`;

    // Always run the deterministic semantic parser as base/fallback
    const localResult = fallbackRuleBasedExtractor(message, financialState);

    // If Gemini client is not available, immediately return deterministic result
    if (!ai) {
      console.log("Gemini API key not configured. Using deterministic financial parser.");
      return res.json(localResult);
    }

    // Call Gemini 3.1 Flash Lite with structured JSON output
    const systemInstruction = `
You are Finora, an AI personal finance memory and decision assistant.
Tagline: "Track your past. See your future. Make better decisions."

PRIMARY TASK:
Extract ANY financial transactions from natural language into structured records:
- Past/Current expenses (e.g. "I bought a biscuit for ₹10", "I spent 10 rupees on biscuits", "I paid ₹450 for electricity", "I bought a ₹25,000 phone", "Yesterday I spent ₹120 on snacks") -> actionType: "add_expense"
- Incomes (e.g. "I received ₹30,000 salary", "My salary is ₹30,000 per month", "I received ₹1,500 from freelancing") -> actionType: "add_income"
- Future commitments/planned expenses (e.g. "I need to pay ₹70,000 college fees in December", "I'm planning to buy a laptop for 70000 next month", "I will buy a biscuit for ₹10 tomorrow") -> actionType: "add_future_expense"

IMPORTANT EXTRACTION RULES:
1. Extract the actual item name, merchant, or source into "sourceOrDescription" (e.g., "biscuit", "electricity", "phone", "college fees", "freelancing", "laptop").
2. "category" MUST be one of: 'Food & Dining', 'Shopping & Gadgets', 'Housing & Rent', 'Utilities & Bills', 'Transport & Fuel', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'Personal Care', or 'Other'. Never reject an unknown purchase; assign a sensible category or 'Other'.
3. "amount" MUST be a clean numeric value in INR (e.g. 10, 450, 25000, 70000, 1500).
4. "frequency" MUST be 'one-time' or 'monthly' or 'yearly'.
5. If the user asks a financial decision question (e.g., "Can I afford a ₹40,000 phone?" or "What happens if I wait 2 months?"):
   - Base your reply strictly on the CURRENT STORED FINANCIAL DATA provided in the prompt.
   - For affordability: compare the item cost with current recorded balance (${formatINR(summary.recordedBalance || 0)}) and upcoming liabilities (${formatINR(summary.totalUpcomingLiabilities || 0)}).
   - For wait scenarios: compute added monthly income (${formatINR(summary.monthlyRecurringIncome || 0)} × months) and calculate the projected balance.

Respond with strict JSON matching the requested schema.
`;

    const prompt = `
User Message: "${message}"

${financialContext}
`;

    const apiPromise = ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedActions: {
              type: Type.ARRAY,
              description: "Financial entries extracted from the user's message",
              items: {
                type: Type.OBJECT,
                properties: {
                  actionType: {
                    type: Type.STRING,
                    enum: ["add_income", "add_expense", "add_future_expense"],
                  },
                  amount: {
                    type: Type.NUMBER,
                    description: "Numeric amount in INR without currency symbols or commas",
                  },
                  sourceOrDescription: {
                    type: Type.STRING,
                    description: "Name of the income source or expense item (e.g. 'Biscuit', 'Electricity', 'Phone', 'Salary', 'College fees')",
                  },
                  category: {
                    type: Type.STRING,
                    description: "Category: 'Food & Dining', 'Shopping & Gadgets', 'Housing & Rent', 'Utilities & Bills', 'Transport & Fuel', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'Personal Care', or 'Other'",
                  },
                  frequency: {
                    type: Type.STRING,
                    enum: ["one-time", "monthly", "yearly"],
                  },
                  dateOrExpectedDate: {
                    type: Type.STRING,
                    description: "Date or timeframe (e.g., '2026-09-18', 'December', 'Next month', 'Yesterday')",
                  },
                },
                required: ["actionType", "amount", "sourceOrDescription"],
              },
            },
            reply: {
              type: Type.STRING,
              description: "Direct, helpful natural-language reply explaining the recorded item or calculating affordability/projections.",
            },
            requiresClarification: {
              type: Type.BOOLEAN,
              description: "True only if the user was trying to log a transaction but did not specify an amount.",
            },
          },
          required: ["extractedActions", "reply", "requiresClarification"],
        },
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API call timed out after 10 seconds")), 10000)
    );

    const response: any = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = response.text?.trim() || "{}";
    const parsedData = JSON.parse(responseText);

    // Normalize and clean Gemini extracted actions
    let finalActions = Array.isArray(parsedData.extractedActions) ? parsedData.extractedActions : [];

    finalActions = finalActions.map((act: any) => ({
      ...act,
      amount: Number(act.amount) || 0,
      sourceOrDescription: (act.sourceOrDescription || 'Transaction').trim(),
      category: normalizeCategory(act.category, act.sourceOrDescription),
      dateOrExpectedDate: act.dateOrExpectedDate || new Date().toISOString().split('T')[0],
      frequency: act.frequency || 'one-time',
    })).filter((act: any) => act.amount > 0);

    // If Gemini didn't extract actions but the semantic parser found a valid transaction, merge them
    if (finalActions.length === 0 && localResult.extractedActions.length > 0) {
      finalActions = localResult.extractedActions;
    }

    return res.json({
      extractedActions: finalActions,
      reply: parsedData.reply || localResult.reply,
      requiresClarification: Boolean(parsedData.requiresClarification),
    });
  } catch (error: any) {
    console.warn("Gemini generation failed or timed out, seamlessly using deterministic extractor:", error.message);
    try {
      const fallback = fallbackRuleBasedExtractor(req.body.message || "", req.body.financialState || {});
      return res.json(fallback);
    } catch (fallbackError) {
      return res.status(500).json({
        error: "Failed to process message.",
        details: error?.message || "Internal server error",
      });
    }
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Finora", version: "1.0.0" });
});

// Start server with Vite middleware in dev or static files in prod
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Finora server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});
