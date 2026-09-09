export type TransactionType = "income" | "expense";
export type PaymentMethod = "Cash" | "Bank Transfer" | "POS" | "Card" | "Wallet" | "Other";
export type ProfileType = "individual" | "trader" | "business";

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  type: TransactionType;
  amount: number;
  category: string;
  account: string;
  paymentMethod: PaymentMethod;
  description: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  income: number;
  expenses: number;
  net: number;
  expenseRatio: number;
  savingsRate: number;
}

export interface InsightResponse {
  current: Summary;
  previous: Summary;
  incomeChange: number;
  expenseChange: number;
  projectedIncome: number;
  projectedExpenses: number;
  projectedNet: number;
  score: number;
  notes: string[];
  topCategory?: { name:string; value:number };
  anomaly?: { category:string; current:number; previous:number; change:number };
}
