import { hydratePlatform, persistPlatform } from "@/lib/platform/google-sync";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, safeUser } from "@/lib/platform/auth";
import {
  audit,
  db,
  hashPassword,
  id,
  token,
  tokenHash,
} from "@/lib/platform/store";
export async function POST(req: Request) {
  try {
    await hydratePlatform();
    const b = await req.json();
    const email = String(b.email || "")
        .trim()
        .toLowerCase(),
      username = String(b.username || "")
        .trim()
        .toLowerCase(),
      password = String(b.password || "");
    if (
      !email.includes("@") ||
      !/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username) ||
      password.length < 8
    )
      return NextResponse.json(
        {
          error:
            "Use a valid email, a 3–32 character username, and a password of at least 8 characters.",
        },
        { status: 400 },
      );
    if (
      db().users.some(
        (u) =>
          u.email.toLowerCase() === email ||
          u.username.toLowerCase() === username,
      )
    )
      return NextResponse.json(
        { error: "An account already exists for this email or username." },
        { status: 409 },
      );
    const now = new Date(),
      hp = hashPassword(password),
      uid = id("USR");
    const user = {
      id: uid,
      name: String(b.name || "New User").trim(),
      username,
      email,
      phone: String(b.phone || ""),
      passwordHash: hp.hash,
      passwordSalt: hp.salt,
      role: "user" as const,
      profileType: (b.profileType || "individual") as any,
      currency: "NGN",
      country: String(b.country || "Nigeria"),
      status: "active" as const,
      emailVerified: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    db().users.push(user);
    const trialEnd = new Date(now.getTime() + 14 * 864e5);
    db().subscriptions.push({
      id: id("SUB"),
      userId: uid,
      planCode: "business",
      billingCycle: "monthly",
      status: "trialing",
      startsAt: now.toISOString(),
      renewsAt: trialEnd.toISOString(),
      trialEndsAt: trialEnd.toISOString(),
      source: "signup_trial",
      amount: 0,
    });
    const raw = token(),
      exp = new Date(now.getTime() + 7 * 864e5);
    db().sessions.push({
      id: id("SES"),
      userId: uid,
      tokenHash: tokenHash(raw),
      createdAt: now.toISOString(),
      expiresAt: exp.toISOString(),
    });
    (await cookies()).set(COOKIE, raw, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: exp,
    });
    audit(uid, "register", "user", uid, "14-day Business trial created");
    await persistPlatform();
    return NextResponse.json({ user: safeUser(user) });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json(
      { error: "Registration is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
