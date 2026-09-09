import {hydratePlatform,persistPlatform} from '@/lib/platform/google-sync';
import {NextResponse} from 'next/server';import {cookies} from 'next/headers';import {COOKIE} from '@/lib/platform/auth';import {db,tokenHash} from '@/lib/platform/store';
export async function POST(){await hydratePlatform();const c=await cookies(),raw=c.get(COOKIE)?.value;if(raw)db().sessions=db().sessions.filter(s=>s.tokenHash!==tokenHash(raw));c.delete(COOKIE);await persistPlatform();return NextResponse.json({ok:true});}
