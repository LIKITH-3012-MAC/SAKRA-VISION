# SAKRA VISION
### Premium Indian Stock Market Intelligence Platform
*ANALYZE · ANTICIPATE · ACCUMULATE*

---

## 1. Executive Summary

**SAKRA VISION** is a full-stack financial intelligence and portfolio research terminal engineered for Indian equities listed on the **National Stock Exchange (NSE)** and the **Bombay Stock Exchange (BSE)**.

Built with an editorial private-wealth aesthetic (inspired by classic wealth management terminals and timeless financial publications), SAKRA VISION combines mathematical technical indicators, Bhavcopy historical price action, public web research, and reasoning synthesis powered by the **Groq API** (`llama-3.3-70b-versatile`).

---

## 2. Brand Identity & Visual System

- **Brand Name**: SAKRA VISION
- **Brand Tagline**: `ANALYZE · ANTICIPATE · ACCUMULATE`
- **Primary Palette**:
  - Deep Forest Green: `#0F2A24`
  - Secondary Forest Green: `#193D32`
  - Warm Ivory Canvas: `#F8F3E8`
  - Soft Cream Surface: `#F2E9D8`
  - Pure White Card: `#FFFFFF`
  - Antique Gold Accent: `#C9A568`
  - Light Gold Borders: `#E5D7BB`
  - Main Text: `#172820`
  - Secondary Muted Text: `#726B5D`
  - Restrained Positive Green: `#26754D`
  - Muted Brick Red: `#B84B43`
- **Typography**:
  - Editorial Headlines: `Cormorant Garamond` & `DM Serif Display`
  - Body & UI: `Inter` / `Manrope`
  - Tabular Numerals: `JetBrains Mono`

### Logo Assets
The official SAKRA VISION triangular metallic emblem with its central orb has been preserved and recolored into the forest green and champagne gold palette:
- `client/public/brand/sakra-vision-logo.png` — Dark variant (Deep forest green `#0F2A24` + champagne gold highlights)
- `client/public/brand/sakra-vision-light.png` — Warm ivory variant
- `client/public/brand/sakra-vision-mark.png` — Cropped emblem mark for sidebar and favicon
- `client/public/brand/sakra-vision-original.png` — Unaltered original blue asset preserved for source-of-truth integrity

---

## 3. Technology Stack

- **Frontend**:
  - React 18 & Vite
  - React Router v6
  - Tailwind CSS with bespoke SAKRA tokens
  - Recharts for financial area, volume, and sector allocation charts
  - Lucide React iconography
- **Backend**:
  - Node.js (ES Modules)
  - Express.js REST API Architecture (`/api/v1`)
  - Zod request body & parameter validation
  - `mysql2/promise` with connection pooling
  - Structured JSON logging with automatic secret redaction
  - `node-cron` for market session reconciliation schedules
- **AI Engine**:
  - **Groq API** (`GROQ_API_KEY`, `GROQ_MODEL=llama-3.3-70b-versatile`)
  - *Strictly NO Ollama*
- **Web Research**:
  - **Firecrawl API v2** for corporate announcements, filing disclosures, and page scraping
- **Market Data**:
  - **Groww API Adapter** (`GROWW_API_KEY`, `GROWW_ACCESS_TOKEN`)
  - **NSE Bhavcopy Historical Engine** (`TradDt`, `TckrSymb`, `ClsPric`, etc. supporting `tejhq/indian-markets` / `tej-bazaar`)

---

## 4. Platform Modules & Routes

1. **Dashboard** (`/dashboard` or `/`)
   - Flagship wealth terminal with greeting, NIFTY 50 interactive chart, portfolio overview, top accumulators, pullback watch, and Groq-synthesized AI executive briefing.
2. **Market Overview** (`/market`)
   - NSE & BSE benchmark indices (NIFTY 50, SENSEX, NIFTY BANK, NIFTY IT, MIDCAP), market advance/decline breadth, sector heatmap, and CM turnover leaders.
3. **Stock Screener** (`/screener`)
   - Multi-factor screener with symbol search, sector filters, RSI bounds, 50-EMA trend alignment, and sortable columns.
4. **Stock Research** (`/stocks/:symbol`)
   - Detailed company dossier with OHLC charts, volume bars, fundamentals (P/E, P/B, Beta, 52W range), algorithmic technical gauge (RSI, EMA, MACD), and Groq AI thesis.
5. **Watchlist** (`/watchlist`)
   - User-curated equity watchlists with live quotes, daily change, personalized thesis notes, and breakout alert tags.
6. **Research & News** (`/research`)
   - Real-time search of corporate disclosures powered by Firecrawl API, with automatic Groq AI risk synthesis and direct source attribution links.
7. **Portfolio** (`/portfolio`)
   - Personal wealth tracker with holdings ledger, sector allocation donut chart, concentration risk audits, and add/edit/delete modals.
8. **Prediction Lab** (`/predictions`)
   - Quantitative evaluation of statistical scenarios (Mean Reversion, Volatility Breakout) with calibrated win-rates, Sharpe ratios, and walk-forward backtests.
9. **Reports** (`/reports`)
   - Institutional daily market dispatches, portfolio risk audits, historical report archive, and one-click CSV export.
10. **Settings** (`/settings`)
    - Investor profile, theme preferences (Warm Ivory vs Deep Forest Dark), notification controls, and backend API status diagnostics.

---

## 5. Local Setup & Quickstart

### Prerequisites
- Node.js v20+ (Node v22 installed and verified)
- npm v10+
- MySQL 8.0+ (optional: the application runs with hybrid resilient fallbacks if MySQL credentials are not yet entered)

### Installation

1. **Clone and enter the workspace**:
   ```bash
   cd sakra-stock
   ```

2. **Install frontend and backend dependencies**:
   ```bash
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` in `server`:
   ```bash
   cp server/.env.example server/.env
   ```
   Add your optional provider keys if available:
   - `GROQ_API_KEY`: Official Groq API Key
   - `FIRECRAWL_API_KEY`: Firecrawl Search API Key
   - `GROWW_API_KEY` & `GROWW_ACCESS_TOKEN`: Groww market data credentials
   - `DB_PASSWORD`: MySQL root password (if connecting to local MySQL instance)

4. **Initialize MySQL Database (Optional if using local MySQL)**:
   ```bash
   mysql -u root -p < database/migrations/001_initial_schema.sql
   mysql -u root -p < database/seeds/001_seed_market_data.sql
   ```

5. **Run Historical Bhavcopy Data Importer**:
   ```bash
   cd server
   npm run import-data
   cd ..
   ```

6. **Start the Application**:
   In terminal 1 (Backend REST Server):
   ```bash
   cd server && npm run dev
   # Runs on http://localhost:4000
   ```
   In terminal 2 (Frontend Client):
   ```bash
   cd client && npm run dev
   # Runs on http://localhost:5173
   ```

---

## 6. Running Tests

Run the complete backend test suite (unit tests for indicators & Supertest API integration tests):
```bash
cd server
npm test
```

All 13 tests verify indicator accuracy (SMA, EMA, RSI, Bollinger Bands, ATR, Relative Volume) and REST endpoint validation.

---

## 7. Security Architecture

- **Backend-Only Secrets**: The Vite client application receives zero API secrets or database credentials.
- **Untrusted Web Content Guardrails**: Firecrawl search and scraped text are strictly sandboxed as untrusted data before Groq summarization.
- **Secret Redaction**: Structured logger automatically suppresses sensitive tokens (`password`, `key`, `token`, `auth`).
- **Input Validation**: All incoming REST payloads are strictly validated using Zod schemas before processing.
