import {hydratePlatform,persistPlatform} from '@/lib/platform/google-sync';
import {NextResponse} from 'next/server';import {currentUser,isAdmin} from '@/lib/platform/auth';import {db} from '@/lib/platform/store';
export async function GET(){await hydratePlatform();const u=await currentUser();if(!isAdmin(u))return NextResponse.json({error:'Forbidden'},{status:403});return NextResponse.json(db().audits.slice(0,300));}
