import { NextResponse } from "next/server";
import { getFinanceRepository } from "@/lib/repositories";
import { answerFinanceQuestion, buildInsights } from "@/lib/services/finance";
const USER="USR-001";
export async function GET(){return NextResponse.json(buildInsights(await getFinanceRepository().listTransactions(USER)))}
export async function POST(req:Request){const {question}=await req.json();if(!question?.trim())return NextResponse.json({error:"Ask a question about your money."},{status:400});const txs=await getFinanceRepository().listTransactions(USER);return NextResponse.json({answer:answerFinanceQuestion(question,txs)})}
