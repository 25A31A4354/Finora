# Finora

> **AI-Powered Personal Financial Memory & Decision Assistant**

Finora helps you track past financial activity, project future trajectories, and make confident spending and saving decisions through conversational AI powered by Google Gemini.

---

## ✨ Features

- 💡 **AI Financial Memory & Queries**: Natural language search across past transactions and spend history.
- 🔮 **Predictive Cash Flow & Decision Simulator**: Simulate major purchases and assess their financial impact before buying.
- 📊 **Categorical Breakdown & Analytics**: Visual breakdown of your monthly expenditure across categories.
- ⚡ **Instant Manual Entry & Smart Tagging**: Quick transaction logging with automatic category detection.
- 🇮🇳 **Localized Formatting**: Native INR currency formatting and expense categories.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/25A31A4354/Finora.git
   cd Finora
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend / Server**: Node.js, Express, TSX
- **Bundler & Tooling**: Vite 8, ESBuild
- **AI**: Google GenAI SDK (`@google/genai`)

---

## 📜 License

MIT License.
