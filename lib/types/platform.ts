export type Role =
  | "user"
  | "support_admin"
  | "finance_admin"
  | "system_admin"
  | "super_admin"
  | "global_super_admin";
export type ProfileKind =
  | "individual"
  | "trader"
  | "freelancer"
  | "household"
  | "business";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  passwordHash: string;
  passwordSalt: string;
  role: Role;
  profileType: ProfileKind;
  currency: string;
  country: string;
  status: "active" | "suspended";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
}
export interface Plan {
  id: string;
  code: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  trialDays: number;
  active: boolean;
  description: string;
  aiQuota: number;
  transactionLimit: number;
  accountLimit: number;
  features: string[];
}
export interface Subscription {
  id: string;
  userId: string;
  planCode: string;
  billingCycle: "monthly" | "yearly" | "manual";
  status: SubscriptionStatus;
  startsAt: string;
  renewsAt: string;
  trialEndsAt?: string;
  cancelledAt?: string;
  source: string;
  amount: number;
}
export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  method: string;
  reference: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paidAt?: string;
  createdAt: string;
}
export interface Audit {
  id: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}
export interface Entitlements {
  planCode: string;
  features: string[];
  aiQuota: number;
  transactionLimit: number;
  accountLimit: number;
}
