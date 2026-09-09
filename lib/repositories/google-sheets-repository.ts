import crypto from "node:crypto";
import { getGoogleCredentials } from "@/lib/google-credentials";
import { FinanceRepository } from "@/lib/repositories/finance-repository";
import { Transaction } from "@/lib/types/finance";

function b64(input:Buffer|string){return Buffer.from(input).toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}
async function token(){
 const {email,key}=getGoogleCredentials();
 const now=Math.floor(Date.now()/1000),h=b64(JSON.stringify({alg:"RS256",typ:"JWT"})),p=b64(JSON.stringify({iss:email,scope:"https://www.googleapis.com/auth/spreadsheets",aud:"https://oauth2.googleapis.com/token",exp:now+3600,iat:now}));
 const u=`${h}.${p}`,sig=crypto.sign("RSA-SHA256",Buffer.from(u),key),assertion=`${u}.${b64(sig)}`;
 const res=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion}),cache:"no-store"});
 if(!res.ok)throw new Error(`Google OAuth failed: ${await res.text()}`);return (await res.json()).access_token as string;
}
function rowToTx(r:string[]):Transaction{return{id:r[0],userId:r[1],date:r[2],type:r[3] as any,amount:Number(r[4]||0),category:r[5],account:r[6],paymentMethod:r[7] as any,description:r[8]||"",reference:r[9]||"",createdAt:r[10]||r[2],updatedAt:r[11]||r[2]}}
function txToRow(t:Transaction){return[t.id,t.userId,t.date,t.type,t.amount,t.category,t.account,t.paymentMethod,t.description,t.reference||"",t.createdAt,t.updatedAt,""]}
export class GoogleSheetsFinanceRepository implements FinanceRepository{
 private id=process.env.GOOGLE_SHEETS_SPREADSHEET_ID!; private range="Transactions!A:M";
 private async req(path:string,init:RequestInit={}){const tk=await token();const r=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.id}/${path}`,{...init,headers:{Authorization:`Bearer ${tk}`,"Content-Type":"application/json",...(init.headers||{})},cache:"no-store"});if(!r.ok)throw new Error(`Google Sheets error: ${await r.text()}`);return r.status===204?{}:r.json()}
 private async rows(){const d=await this.req(`values/${encodeURIComponent(this.range)}`);return (d.values||[]) as string[][]}
 async listTransactions(userId:string){return (await this.rows()).slice(1).filter(r=>r[0]).map(rowToTx).filter(t=>t.userId===userId).sort((a,b)=>+new Date(b.date)-+new Date(a.date))}
 async createTransaction(tx:Transaction){await this.req(`values/${encodeURIComponent(this.range)}:append?valueInputOption=USER_ENTERED`,{method:"POST",body:JSON.stringify({values:[txToRow(tx)]})});return tx}
 async updateTransaction(id:string,userId:string,patch:Partial<Transaction>){const rows=await this.rows();const idx=rows.findIndex((r,i)=>i>0&&r[0]===id&&r[1]===userId);if(idx<0)return null;const old=rowToTx(rows[idx]),tx={...old,...patch,id,userId,updatedAt:new Date().toISOString()};const row=idx+1;await this.req(`values/${encodeURIComponent(`Transactions!A${row}:M${row}`)}?valueInputOption=USER_ENTERED`,{method:"PUT",body:JSON.stringify({values:[txToRow(tx)]})});return tx}
 async deleteTransaction(id:string,userId:string){const rows=await this.rows();const idx=rows.findIndex((r,i)=>i>0&&r[0]===id&&r[1]===userId);if(idx<0)return false;const row=idx+1;await this.req(`values/${encodeURIComponent(`Transactions!A${row}:M${row}`)}:clear`,{method:"POST",body:"{}"});return true}
}
