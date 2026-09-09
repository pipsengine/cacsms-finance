import crypto from "node:crypto";
import { db, bootstrapAdmin, provisionGlobalAdministrator } from "./store";
import {
  Audit,
  Payment,
  Plan,
  Session,
  Subscription,
  User,
} from "@/lib/types/platform";
import {
  getGoogleCredentials,
  hasGoogleCredentials,
} from "@/lib/google-credentials";
import { DEFAULT_PLANS } from "@/lib/platform/defaults";
const ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const configured = () => !!(ID && hasGoogleCredentials());
function b64(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
async function accessToken() {
  const { email, key } = getGoogleCredentials(),
    now = Math.floor(Date.now() / 1000),
    h = b64(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    p = b64(
      JSON.stringify({
        iss: email,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
      }),
    ),
    u = `${h}.${p}`,
    sig = crypto.sign("RSA-SHA256", Buffer.from(u), key),
    assertion = `${u}.${b64(sig)}`;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Google OAuth failed");
  return (await r.json()).access_token as string;
}
async function api(path: string, init: RequestInit = {}) {
  const t = await accessToken(),
    r = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${ID}/${path}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
          ...(init.headers || {}),
        },
        cache: "no-store",
      },
    );
  if (!r.ok)
    throw new Error(`Google Sheets platform sync failed: ${await r.text()}`);
  return r.json();
}
const defs = {
  Users: {
    h: [
      "id",
      "name",
      "email",
      "phone",
      "passwordHash",
      "passwordSalt",
      "role",
      "profileType",
      "currency",
      "country",
      "status",
      "emailVerified",
      "createdAt",
      "updatedAt",
      "username",
    ],
    rows: (x: User[]) =>
      x.map((u) => [
        u.id,
        u.name,
        u.email,
        u.phone || "",
        u.passwordHash,
        u.passwordSalt,
        u.role,
        u.profileType,
        u.currency,
        u.country,
        u.status,
        String(u.emailVerified),
        u.createdAt,
        u.updatedAt,
        u.username,
      ]),
  },
  Sessions: {
    h: ["id", "userId", "tokenHash", "expiresAt", "createdAt"],
    rows: (x: Session[]) =>
      x.map((s) => [s.id, s.userId, s.tokenHash, s.expiresAt, s.createdAt]),
  },
  Plans: {
    h: [
      "id",
      "code",
      "name",
      "monthlyPrice",
      "yearlyPrice",
      "trialDays",
      "active",
      "description",
      "aiQuota",
      "transactionLimit",
      "accountLimit",
      "features",
    ],
    rows: (x: Plan[]) =>
      x.map((p) => [
        p.id,
        p.code,
        p.name,
        p.monthlyPrice,
        p.yearlyPrice,
        p.trialDays,
        String(p.active),
        p.description,
        p.aiQuota,
        p.transactionLimit,
        p.accountLimit,
        p.features.join("|"),
      ]),
  },
  Subscriptions: {
    h: [
      "id",
      "userId",
      "planCode",
      "billingCycle",
      "status",
      "startsAt",
      "renewsAt",
      "trialEndsAt",
      "cancelledAt",
      "source",
      "amount",
    ],
    rows: (x: Subscription[]) =>
      x.map((s) => [
        s.id,
        s.userId,
        s.planCode,
        s.billingCycle,
        s.status,
        s.startsAt,
        s.renewsAt,
        s.trialEndsAt || "",
        s.cancelledAt || "",
        s.source,
        s.amount,
      ]),
  },
  Payments: {
    h: [
      "id",
      "userId",
      "subscriptionId",
      "amount",
      "currency",
      "method",
      "reference",
      "status",
      "paidAt",
      "createdAt",
    ],
    rows: (x: Payment[]) =>
      x.map((p) => [
        p.id,
        p.userId,
        p.subscriptionId,
        p.amount,
        p.currency,
        p.method,
        p.reference,
        p.status,
        p.paidAt || "",
        p.createdAt,
      ]),
  },
  AuditLog: {
    h: [
      "id",
      "actorUserId",
      "action",
      "entity",
      "entityId",
      "details",
      "createdAt",
    ],
    rows: (x: Audit[]) =>
      x.map((a) => [
        a.id,
        a.actorUserId,
        a.action,
        a.entity,
        a.entityId,
        a.details,
        a.createdAt,
      ]),
  },
};
const HYDRATION_TTL_MS = 10_000;
let initialized = false;
let lastHydratedAt = 0;
let hydrationPromise: Promise<void> | null = null;
async function ensure() {
  if (!configured() || initialized) return;
  const meta = await api("?fields=sheets.properties.title"),
    existing = new Set((meta.sheets || []).map((s: any) => s.properties.title)),
    requests = Object.keys(defs)
      .filter((x) => !existing.has(x))
      .map((title) => ({ addSheet: { properties: { title } } }));
  if (requests.length)
    await api(":batchUpdate", {
      method: "POST",
      body: JSON.stringify({ requests }),
    });
  initialized = true;
}
async function readPlatformSheets(names: string[]) {
  const query = new URLSearchParams();
  names.forEach((name) => query.append("ranges", `${name}!A:Z`));
  const response = await api(`values:batchGet?${query.toString()}`);
  return names.map(
    (_, index) => (response.valueRanges?.[index]?.values || []) as string[][],
  );
}

async function loadPlatform() {
  if (!configured())
    throw new Error("Google Sheets platform storage is not configured");
  await ensure();
  const d = db();
  const [u, se, p, s, pa, a] = await readPlatformSheets([
    "Users",
    "Sessions",
    "Plans",
    "Subscriptions",
    "Payments",
    "AuditLog",
  ]);
  if (u.length > 1)
    d.users = u
      .slice(1)
      .filter((r) => r[0])
      .map((r) => ({
        id: r[0],
        name: r[1],
        username: r[14] || r[2].split("@")[0],
        email: r[2],
        phone: r[3],
        passwordHash: r[4],
        passwordSalt: r[5],
        role: r[6] as any,
        profileType: r[7] as any,
        currency: r[8],
        country: r[9],
        status: r[10] as any,
        emailVerified: r[11] === "true",
        createdAt: r[12],
        updatedAt: r[13],
      }));
  if (se.length > 1)
    d.sessions = se
      .slice(1)
      .filter((r) => r[0])
      .map((r) => ({
        id: r[0],
        userId: r[1],
        tokenHash: r[2],
        expiresAt: r[3],
        createdAt: r[4],
      }));
  if (p.length > 1)
    d.plans = p
      .slice(1)
      .filter((r) => r[0])
      .map((r) => ({
        id: r[0],
        code: r[1],
        name: r[2],
        monthlyPrice: +r[3],
        yearlyPrice: +r[4],
        trialDays: +r[5],
        active: r[6] === "true",
        description: r[7],
        aiQuota: +r[8],
        transactionLimit: +r[9],
        accountLimit: +r[10],
        features: (r[11] || "").split("|").filter(Boolean),
      }));
  if (s.length > 1)
    d.subscriptions = s
      .slice(1)
      .filter((r) => r[0])
      .map((r) => ({
        id: r[0],
        userId: r[1],
        planCode: r[2],
        billingCycle: r[3] as any,
        status: r[4] as any,
        startsAt: r[5],
        renewsAt: r[6],
        trialEndsAt: r[7] || undefined,
        cancelledAt: r[8] || undefined,
        source: r[9],
        amount: +r[10],
      }));
  if (pa.length > 1)
    d.payments = pa
      .slice(1)
      .filter((r) => r[0])
      .map((r) => ({
        id: r[0],
        userId: r[1],
        subscriptionId: r[2],
        amount: +r[3],
        currency: r[4],
        method: r[5],
        reference: r[6],
        status: r[7] as any,
        paidAt: r[8] || undefined,
        createdAt: r[9],
      }));
  if (a.length > 1)
    d.audits = a
      .slice(1)
      .filter((r) => r[0])
      .map((r) => ({
        id: r[0],
        actorUserId: r[1],
        action: r[2],
        entity: r[3],
        entityId: r[4],
        details: r[5],
        createdAt: r[6],
      }));
  let needsPersist = false;
  for (const defaultPlan of DEFAULT_PLANS) {
    if (!d.plans.some((plan) => plan.code === defaultPlan.code)) {
      d.plans.push(structuredClone(defaultPlan));
      needsPersist = true;
    }
  }
  if (u.length <= 1) {
    bootstrapAdmin();
    needsPersist = true;
  }
  if (provisionGlobalAdministrator()) needsPersist = true;
  const protectedUser = d.users.find(
    (user) =>
      user.id === "USR-GLOBAL-CACSMS" ||
      user.username.toLowerCase() === "cacsms",
  );
  if (protectedUser) {
    if (
      protectedUser.id !== "USR-GLOBAL-CACSMS" ||
      protectedUser.username !== "cacsms" ||
      protectedUser.role !== "global_super_admin" ||
      protectedUser.status !== "active"
    ) {
      protectedUser.id = "USR-GLOBAL-CACSMS";
      protectedUser.username = "cacsms";
      protectedUser.role = "global_super_admin";
      protectedUser.status = "active";
      protectedUser.updatedAt = new Date().toISOString();
      needsPersist = true;
    }
    let unlimited = d.subscriptions.find(
      (subscription) =>
        subscription.userId === protectedUser.id &&
        subscription.planCode === "unlimited",
    );
    if (!unlimited) {
      unlimited = {
        id: "SUB-GLOBAL-CACSMS",
        userId: protectedUser.id,
        planCode: "unlimited",
        billingCycle: "manual",
        status: "active",
        startsAt: new Date().toISOString(),
        renewsAt: "9999-12-31T23:59:59.000Z",
        source: "system_protected",
        amount: 0,
      };
      d.subscriptions.push(unlimited);
      needsPersist = true;
    }
    if (
      unlimited.status !== "active" ||
      unlimited.renewsAt !== "9999-12-31T23:59:59.000Z"
    ) {
      unlimited.status = "active";
      unlimited.renewsAt = "9999-12-31T23:59:59.000Z";
      unlimited.cancelledAt = undefined;
      needsPersist = true;
    }
  }
  if (needsPersist) await persistPlatform();
}

export async function hydratePlatform() {
  if (Date.now() - lastHydratedAt < HYDRATION_TTL_MS) return;
  if (hydrationPromise) return hydrationPromise;
  const pending = loadPlatform();
  hydrationPromise = pending;
  try {
    await pending;
    lastHydratedAt = Date.now();
  } finally {
    if (hydrationPromise === pending) hydrationPromise = null;
  }
}

export async function persistPlatform() {
  if (!configured()) return;
  await ensure();
  const d = db(),
    sets: any = {
      Users: d.users,
      Sessions: d.sessions,
      Plans: d.plans,
      Subscriptions: d.subscriptions,
      Payments: d.payments,
      AuditLog: d.audits,
    };
  for (const [name, items] of Object.entries(sets)) {
    const def = (defs as any)[name];
    await api(`values/${encodeURIComponent(name + "!A:Z")}:clear`, {
      method: "POST",
      body: "{}",
    });
    await api(
      `values/${encodeURIComponent(name + "!A1")}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({ values: [def.h, ...def.rows(items)] }),
      },
    );
  }
  lastHydratedAt = Date.now();
}
