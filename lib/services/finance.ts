import { Transaction } from "@/lib/types/finance";
export const currency=(n:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
export function summarize(txs:Transaction[]){const income=txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),expenses=txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),net=income-expenses;return{income,expenses,net,expenseRatio:income?expenses/income*100:0,savingsRate:income?net/income*100:0}}
export function monthTransactions(txs:Transaction[],offset=0){const now=new Date(),target=new Date(now.getFullYear(),now.getMonth()+offset,1);return txs.filter(t=>{const d=new Date(t.date);return d.getFullYear()===target.getFullYear()&&d.getMonth()===target.getMonth()})}
export function categories(txs:Transaction[],type:"income"|"expense"="expense"){const m=new Map<string,number>();txs.filter(t=>t.type===type).forEach(t=>m.set(t.category,(m.get(t.category)||0)+t.amount));return[...m.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)}
const pct=(a:number,b:number)=>b?((a-b)/b)*100:(a?100:0);
export function buildInsights(txs:Transaction[]){
 const curTx=monthTransactions(txs,0),prevTx=monthTransactions(txs,-1),current=summarize(curTx),previous=summarize(prevTx),incomeChange=pct(current.income,previous.income),expenseChange=pct(current.expenses,previous.expenses),expenseCats=categories(curTx),top=expenseCats[0];
 const day=Math.max(1,new Date().getDate()),days=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate(),projectedIncome=current.income/day*days,projectedExpenses=current.expenses/day*days,projectedNet=projectedIncome-projectedExpenses;
 const prevCats=new Map(categories(prevTx).map(c=>[c.name,c.value]));const anomalies=expenseCats.map(c=>({category:c.name,current:c.value,previous:prevCats.get(c.name)||0,change:pct(c.value,prevCats.get(c.name)||0)})).filter(x=>x.current>0&&x.change>35).sort((a,b)=>b.change-a.change);const anomaly=anomalies[0];
 const score=Math.max(0,Math.min(100,Math.round(68+(current.net>0?12:-20)+(current.savingsRate>20?7:0)-Math.max(0,expenseChange)/5+Math.max(0,incomeChange)/7)));
 const notes=[
  previous.income?`Income is ${Math.abs(incomeChange).toFixed(1)}% ${incomeChange>=0?"higher":"lower"} than last month.`:"You are building your first month of comparable income history.",
  previous.expenses?`Expenses are ${Math.abs(expenseChange).toFixed(1)}% ${expenseChange>=0?"higher":"lower"} than last month.`:"More history will improve expense comparisons.",
  top?`${top.name} is your largest expense category at ${currency(top.value)}.`:"Record expenses to unlock category intelligence.",
  `At the current run rate, your projected month-end net position is ${currency(projectedNet)}.`
 ];
 return{current,previous,incomeChange,expenseChange,projectedIncome,projectedExpenses,projectedNet,score,notes,topCategory:top,anomaly};
}
export function answerFinanceQuestion(q:string,txs:Transaction[]){const text=q.toLowerCase(),ins=buildInsights(txs),cur=monthTransactions(txs,0),cats=categories(cur),incomeCats=categories(cur,"income");
 if(/where|spend|money go|expense/.test(text)){const top=cats.slice(0,4);return top.length?`Your largest spending areas this month are ${top.map(x=>`${x.name} (${currency(x.value)})`).join(", ")}. Total expenses are ${currency(ins.current.expenses)} and your top category represents ${ins.current.expenses?Math.round(top[0].value/ins.current.expenses*100):0}% of spending.`:"You do not yet have enough recorded expenses for a spending breakdown."}
 if(/better|worse|last month|compare/.test(text))return `Compared with last month, income is ${Math.abs(ins.incomeChange).toFixed(1)}% ${ins.incomeChange>=0?"higher":"lower"} and expenses are ${Math.abs(ins.expenseChange).toFixed(1)}% ${ins.expenseChange>=0?"higher":"lower"}. Your current net position is ${currency(ins.current.net)}.`;
 if(/month.?end|left|forecast|last until|afford/.test(text))return `Based on the transactions recorded so far, projected month-end income is ${currency(ins.projectedIncome)}, projected expenses are ${currency(ins.projectedExpenses)}, and projected net position is ${currency(ins.projectedNet)}. This is a run-rate estimate, not a guarantee.`;
 if(/income|earn|sale|revenue/.test(text)){const top=incomeCats[0];return `You have recorded ${currency(ins.current.income)} in income this month${top?`, with ${top.name} contributing the most at ${currency(top.value)}`:""}. That is ${Math.abs(ins.incomeChange).toFixed(1)}% ${ins.incomeChange>=0?"above":"below"} last month.`}
 if(/health|score/.test(text))return `Your current Money Health score is ${ins.score}/100. The score considers whether your net position is positive, how quickly expenses are changing, income movement, and how much of recorded income you retain.`;
 return `This month you have ${currency(ins.current.income)} in money in, ${currency(ins.current.expenses)} in money out, and a net position of ${currency(ins.current.net)}. ${ins.notes[0]} ${ins.notes[2]}`;
}
