# Cacsms Finance

**Your AI Money Intelligence** — a complete two-page finance MVP for traders, workers, freelancers, households and small businesses.

## Main experience

### 1. Overview
- Live money-in, money-out, net-position and daily-position cards
- Fast Money In / Money Out entry
- Full transaction create, edit and delete flow
- 6-month income vs expense trend
- Spending-category breakdown
- Recent transaction register
- Money Health score
- Automatic financial brief
- Unusual-spending detection
- Ask Cacsms conversational financial analysis

### 2. Reports & Insights
- Monthly, quarterly, yearly and custom-date reporting
- Income, expense, net and health KPIs
- 12-month income/expense trend
- Projected month-end income, expenses and net position
- Expense-category analysis
- AI attention points and anomaly flagging
- Searchable/filterable transaction register
- Period-aware CSV export
- Ask Cacsms interface

## Google Sheets backend

The application uses a private Google Sheet through a Google Cloud service account. Google Sheets configuration is required; there is no mock-data or in-memory fallback.

Create a worksheet named exactly `Transactions` with the following row-1 columns:

```text
TransactionID | UserID | Date | Type | Amount | Category | Account | PaymentMethod | Description | Reference | CreatedAt | UpdatedAt | Reserved
```

A ready-made CSV header template is included as `GOOGLE-SHEETS-TEMPLATE.csv`.

### Setup
1. Create a Google Cloud project.
2. Enable Google Sheets API.
3. Create a Service Account and JSON key.
4. Create a private Google Spreadsheet.
5. Share the spreadsheet with the service-account email as **Editor**.
6. Copy `.env.example` to `.env.local`.
7. Add the spreadsheet ID and `GOOGLE_APPLICATION_CREDENTIALS` path to `.env.local`. Alternatively, add the service-account email and private key directly.
8. Run `npm install` then `npm run dev`.

The Google repository supports list, create, edit and delete (delete clears the matching sheet row). The repository interface is intentionally storage-agnostic so a future MSSQL repository can replace Google Sheets without redesigning the UI.

## Ask Cacsms

The included analyst is deterministic and privacy-friendly: it answers common questions from the recorded transaction dataset without sending financial records to an external model. A production LLM can later be connected behind the server-side analysis service for richer narratives.

Supported question families include:
- Where did my money go?
- Am I doing better than last month?
- Will my money last until month-end?
- How much did I earn or sell?
- What is my Money Health score?

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy to Vercel

Set these environment variables for Production and Preview in the Vercel project:

```text
GOOGLE_SHEETS_SPREADSHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
```

Use the complete service-account private key, including its BEGIN/END lines. `GOOGLE_APPLICATION_CREDENTIALS` is intended for local development only because the downloaded credential file is not present in a Vercel deployment. Once the variables are configured, deployments from `main` use the live Google Sheet automatically.

## Production hardening before public launch

Add real authentication and per-user authorization, encrypted secret management, server-side validation, rate limiting, backups, privacy/terms pages, audit logging, data-retention rules, and a persistent user/profile store. Google Sheets is appropriate for the initial MVP but should be migrated when transaction volume and concurrency grow materially.
