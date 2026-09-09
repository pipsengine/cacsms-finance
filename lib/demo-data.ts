import { Transaction } from "@/lib/types/finance";

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();
const d = now.getDate();
const iso = (day: number, monthOffset = 0) => new Date(y, m + monthOffset, Math.max(1, day), 12).toISOString();

export const demoTransactions: Transaction[] = [
  { id:"TXN-1001",userId:"USR-001",date:iso(d),type:"income",amount:125000,category:"Sales",account:"Business Wallet",paymentMethod:"Bank Transfer",description:"Customer sales",createdAt:iso(d),updatedAt:iso(d)},
  { id:"TXN-1002",userId:"USR-001",date:iso(d),type:"expense",amount:18500,category:"Transport",account:"Cash",paymentMethod:"Cash",description:"Delivery and transport",createdAt:iso(d),updatedAt:iso(d)},
  { id:"TXN-1003",userId:"USR-001",date:iso(d-1),type:"income",amount:92000,category:"Sales",account:"POS",paymentMethod:"POS",description:"Shop sales",createdAt:iso(d-1),updatedAt:iso(d-1)},
  { id:"TXN-1004",userId:"USR-001",date:iso(d-2),type:"expense",amount:46000,category:"Stock Purchase",account:"Bank",paymentMethod:"Bank Transfer",description:"Inventory restock",createdAt:iso(d-2),updatedAt:iso(d-2)},
  { id:"TXN-1005",userId:"USR-001",date:iso(d-3),type:"expense",amount:12500,category:"Utilities",account:"Bank",paymentMethod:"Bank Transfer",description:"Electricity",createdAt:iso(d-3),updatedAt:iso(d-3)},
  { id:"TXN-1006",userId:"USR-001",date:iso(d-4),type:"income",amount:160000,category:"Sales",account:"Bank",paymentMethod:"Bank Transfer",description:"Bulk customer order",createdAt:iso(d-4),updatedAt:iso(d-4)},
  { id:"TXN-1007",userId:"USR-001",date:iso(d-5),type:"expense",amount:28000,category:"Food",account:"Cash",paymentMethod:"Cash",description:"Household food",createdAt:iso(d-5),updatedAt:iso(d-5)},
  { id:"TXN-1008",userId:"USR-001",date:iso(d-7),type:"income",amount:450000,category:"Salary",account:"Bank",paymentMethod:"Bank Transfer",description:"Monthly salary",createdAt:iso(d-7),updatedAt:iso(d-7)},
  { id:"TXN-9001",userId:"USR-001",date:iso(18,-1),type:"income",amount:760000,category:"Sales",account:"Bank",paymentMethod:"Bank Transfer",description:"Previous month sales",createdAt:iso(18,-1),updatedAt:iso(18,-1)},
  { id:"TXN-9002",userId:"USR-001",date:iso(10,-1),type:"expense",amount:472000,category:"Business Expenses",account:"Bank",paymentMethod:"Bank Transfer",description:"Previous month expenses",createdAt:iso(10,-1),updatedAt:iso(10,-1)},
  { id:"TXN-9003",userId:"USR-001",date:iso(5,-2),type:"income",amount:705000,category:"Sales",account:"Bank",paymentMethod:"Bank Transfer",description:"Historic sales",createdAt:iso(5,-2),updatedAt:iso(5,-2)},
  { id:"TXN-9004",userId:"USR-001",date:iso(15,-2),type:"expense",amount:451000,category:"Business Expenses",account:"Bank",paymentMethod:"Bank Transfer",description:"Historic expenses",createdAt:iso(15,-2),updatedAt:iso(15,-2)}
];
