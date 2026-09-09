import { hydratePlatform, persistPlatform } from "@/lib/platform/google-sync";
import { NextResponse } from "next/server";
import { currentUser, isAdmin } from "@/lib/platform/auth";
import { audit, db } from "@/lib/platform/store";
export async function GET() {
  await hydratePlatform();
  const u = await currentUser();
  if (!isAdmin(u))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(db().plans);
}
export async function PATCH(req: Request) {
  await hydratePlatform();
  const actor = await currentUser();
  if (
    !actor ||
    !["system_admin", "super_admin", "global_super_admin"].includes(actor.role)
  )
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json(),
    p = db().plans.find((x) => x.code === b.code);
  if (!p)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  if (p.code === "unlimited")
    return NextResponse.json(
      { error: "The protected Unlimited system plan cannot be modified." },
      { status: 403 },
    );
  for (const k of [
    "name",
    "monthlyPrice",
    "yearlyPrice",
    "trialDays",
    "active",
    "description",
    "aiQuota",
    "transactionLimit",
    "accountLimit",
  ] as const)
    if (b[k] !== undefined) (p as any)[k] = b[k];
  if (Array.isArray(b.features)) p.features = b.features;
  audit(actor.id, "update_plan", "plan", p.id, JSON.stringify(b));
  await persistPlatform();
  return NextResponse.json(p);
}
