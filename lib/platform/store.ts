import crypto from "node:crypto";
import { DEFAULT_PLANS } from "./defaults";
import {
  Audit,
  Payment,
  Plan,
  Session,
  Subscription,
  User,
} from "@/lib/types/platform";
type DB = {
  users: User[];
  sessions: Session[];
  plans: Plan[];
  subscriptions: Subscription[];
  payments: Payment[];
  audits: Audit[];
};
const g = globalThis as typeof globalThis & { __cacsmsPlatform?: DB };
function seed(): DB {
  return {
    users: [],
    sessions: [],
    plans: structuredClone(DEFAULT_PLANS),
    subscriptions: [],
    payments: [],
    audits: [],
  };
}
export function db() {
  if (!g.__cacsmsPlatform) g.__cacsmsPlatform = seed();
  return g.__cacsmsPlatform;
}
export const id = (p: string) =>
  `${p}-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
export function hashPassword(
  password: string,
  salt = crypto.randomBytes(16).toString("hex"),
) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString("hex") };
}
export function verifyPassword(password: string, salt: string, hash: string) {
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    crypto.scryptSync(password, salt, 64),
  );
}
export function bootstrapAdmin() {
  const d = db();
  if (d.users.length) return;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase(),
    password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !email.includes("@") || !password || password.length < 12)
    throw new Error(
      "Set BOOTSTRAP_ADMIN_EMAIL and a BOOTSTRAP_ADMIN_PASSWORD of at least 12 characters before initializing the platform",
    );
  const now = new Date().toISOString(),
    hp = hashPassword(password),
    uid = "USR-ADMIN-001";
  d.users.push({
    id: uid,
    name: "Cacsms Administrator",
    username: "admin",
    email,
    passwordHash: hp.hash,
    passwordSalt: hp.salt,
    role: "super_admin",
    profileType: "business",
    currency: "NGN",
    country: "Nigeria",
    status: "active",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  d.subscriptions.push({
    id: "SUB-ADMIN",
    userId: uid,
    planCode: "pro",
    billingCycle: "manual",
    status: "active",
    startsAt: now,
    renewsAt: "2099-12-31T23:59:59.000Z",
    source: "system",
    amount: 0,
  });
}
export function provisionGlobalAdministrator() {
  const d = db();
  if (
    d.users.some(
      (user) =>
        user.id === "USR-GLOBAL-CACSMS" ||
        user.username.toLowerCase() === "cacsms",
    )
  )
    return false;
  const username = process.env.GLOBAL_ADMIN_USERNAME?.trim().toLowerCase(),
    email = process.env.GLOBAL_ADMIN_EMAIL?.trim().toLowerCase(),
    password = process.env.GLOBAL_ADMIN_PASSWORD;
  if (!username && !email && !password) return false;
  if (
    username !== "cacsms" ||
    !email?.includes("@") ||
    !password ||
    password.length < 8
  )
    throw new Error(
      "GLOBAL_ADMIN_USERNAME, GLOBAL_ADMIN_EMAIL, and a GLOBAL_ADMIN_PASSWORD of at least 8 characters are required",
    );
  if (
    d.users.some(
      (user) =>
        user.email.toLowerCase() === email ||
        user.username.toLowerCase() === username,
    )
  )
    throw new Error(
      "The configured global administrator identity is already in use",
    );
  const now = new Date().toISOString(),
    hp = hashPassword(password);
  d.users.push({
    id: "USR-GLOBAL-CACSMS",
    name: "Cacsms Global Administrator",
    username,
    email,
    passwordHash: hp.hash,
    passwordSalt: hp.salt,
    role: "global_super_admin",
    profileType: "business",
    currency: "NGN",
    country: "Nigeria",
    status: "active",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  return true;
}
export const token = () => crypto.randomBytes(32).toString("base64url");
export const tokenHash = (v: string) =>
  crypto.createHash("sha256").update(v).digest("hex");
export function audit(
  actorUserId: string,
  action: string,
  entity: string,
  entityId: string,
  details = "",
) {
  db().audits.unshift({
    id: id("AUD"),
    actorUserId,
    action,
    entity,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  });
}
