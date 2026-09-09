import { hydratePlatform, persistPlatform } from "@/lib/platform/google-sync";
import { NextResponse } from "next/server";
import { currentUser, safeUser } from "@/lib/platform/auth";
import { activeSubscription, entitlements } from "@/lib/platform/subscriptions";
import { db } from "@/lib/platform/store";
export async function GET() {
  await hydratePlatform();
  const u = await currentUser();
  if (!u)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const sub = activeSubscription(u.id);
  const plan = db().plans.find((p) => p.code === (sub?.planCode || "free"));
  return NextResponse.json({
    user: safeUser(u),
    subscription: sub,
    plan,
    entitlements: entitlements(u.id),
  });
}
