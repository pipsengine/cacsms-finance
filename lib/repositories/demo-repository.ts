import { demoTransactions } from "@/lib/demo-data";
import { FinanceRepository } from "@/lib/repositories/finance-repository";
import { Transaction } from "@/lib/types/finance";

const runtimeStore = [...demoTransactions];
export class DemoFinanceRepository implements FinanceRepository {
  async listTransactions(userId: string) { return runtimeStore.filter(t => t.userId === userId).sort((a,b)=>+new Date(b.date)-+new Date(a.date)); }
  async createTransaction(tx: Transaction) { runtimeStore.unshift(tx); return tx; }
  async updateTransaction(id:string,userId:string,patch:Partial<Transaction>) {
    const i=runtimeStore.findIndex(t=>t.id===id&&t.userId===userId); if(i<0)return null;
    runtimeStore[i]={...runtimeStore[i],...patch,id,userId,updatedAt:new Date().toISOString()}; return runtimeStore[i];
  }
  async deleteTransaction(id:string,userId:string) {
    const i=runtimeStore.findIndex(t=>t.id===id&&t.userId===userId); if(i<0)return false; runtimeStore.splice(i,1); return true;
  }
}
