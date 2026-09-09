import { Transaction } from "@/lib/types/finance";
export interface FinanceRepository {
  listTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(tx: Transaction): Promise<Transaction>;
  updateTransaction(id: string, userId: string, patch: Partial<Transaction>): Promise<Transaction | null>;
  deleteTransaction(id: string, userId: string): Promise<boolean>;
}
