import { hydratePlatform, persistPlatform } from "@/lib/platform/google-sync";
import { NextResponse } from "next/server";
import { currentUser, isAdmin, isProtectedUser } from "@/lib/platform/auth";
import { audit, db, id } from "@/lib/platform/store";
export async function GET() {
  await hydratePlatform();
  const u = await currentUser();
  if (!isAdmin(u))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const d = db();
  return NextResponse.json(
    d.subscriptions.map((s) => ({
      ...s,
      user: d.users.find((u) => u.id === s.userId)?.name || s.userId,
      plan: d.plans.find((p) => p.code === s.planCode)?.name || s.planCode,
    })),
  );
}
export async function POST(req: Request) {
  await hydratePlatform();
  const actor = await currentUser();
  if (!isAdmin(actor))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json(),
    plan = db().plans.find((p) => p.code === b.planCode),
    user = db().users.find((u) => u.id === b.userId);
  if (!plan || !user)
    return NextResponse.json(
      { error: "Valid user and plan are required" },
      { status: 400 },
    );
  if (isProtectedUser(user))
    return NextResponse.json(
      { error: "The global system administrator subscription is immutable." },
      { status: 403 },
    );
  db().subscriptions.forEach((s) => {
    if (s.userId === user.id && ["active", "trialing"].includes(s.status))
      s.status = "cancelled";
  });
  const start = new Date(),
    months = Number(b.months || 1),
    end = new Date(start);
  end.setMonth(end.getMonth() + months);
  const cycle = b.billingCycle || "monthly",
    amount =
      b.amount ??
      (cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) * months;
  const sub = {
    id: id("SUB"),
    userId: user.id,
    planCode: plan.code,
    billingCycle: cycle,
    status: "active" as const,
    startsAt: start.toISOString(),
    renewsAt: end.toISOString(),
    source: b.source || "admin_manual",
    amount: Number(amount),
  };
  db().subscriptions.push(sub);
  audit(
    actor!.id,
    "create_subscription",
    "subscription",
    sub.id,
    JSON.stringify(sub),
  );
  await persistPlatform();
  return NextResponse.json(sub, { status: 201 });
}
export async function PATCH(req: Request) {
  await hydratePlatform();
  const actor = await currentUser();
  if (!isAdmin(actor))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json(),
    s = db().subscriptions.find((x) => x.id === b.id);
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (isProtectedUser(db().users.find((user) => user.id === s.userId)))
    return NextResponse.json(
      { error: "The global system administrator subscription is immutable." },
      { status: 403 },
    );
  if (b.status) s.status = b.status;
  if (b.renewsAt) s.renewsAt = b.renewsAt;
  audit(
    actor!.id,
    "update_subscription",
    "subscription",
    s.id,
    JSON.stringify(b),
  );
  await persistPlatform();
  return NextResponse.json(s);
}
