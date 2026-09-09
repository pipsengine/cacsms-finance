import { db } from "./store";
import { Entitlements } from "@/lib/types/platform";
export function activeSubscription(userId: string) {
  return (
    db().subscriptions.find(
      (s) =>
        s.userId === userId &&
        ["active", "trialing"].includes(s.status) &&
        new Date(s.renewsAt) > new Date(),
    ) || null
  );
}
export function entitlements(userId: string): Entitlements {
  const sub = activeSubscription(userId);
  const plan =
    db().plans.find((p) => p.code === (sub?.planCode || "free")) ||
    db().plans[0];
  return {
    planCode: plan.code,
    features: plan.features,
    aiQuota: plan.aiQuota,
    transactionLimit: plan.transactionLimit,
    accountLimit: plan.accountLimit,
  };
}
