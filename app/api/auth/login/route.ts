import { hydratePlatform, persistPlatform } from "@/lib/platform/google-sync";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, safeUser } from "@/lib/platform/auth";
import {
  audit,
  db,
  id,
  token,
  tokenHash,
  verifyPassword,
} from "@/lib/platform/store";
export async function POST(req: Request) {
  try {
    await hydratePlatform();
    const { identifier, email, password } = await req.json();
    const login = String(identifier || email || "")
      .trim()
      .toLowerCase();
    const user = db().users.find(
      (u) =>
        u.email.toLowerCase() === login || u.username.toLowerCase() === login,
    );
    if (
      !user ||
      !verifyPassword(
        String(password || ""),
        user.passwordSalt,
        user.passwordHash,
      )
    )
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 },
      );
    if (user.status !== "active")
      return NextResponse.json(
        { error: "This account is suspended." },
        { status: 403 },
      );
    const raw = token(),
      now = new Date(),
      exp = new Date(now.getTime() + 7 * 864e5);
    db().sessions.push({
      id: id("SES"),
      userId: user.id,
      tokenHash: tokenHash(raw),
      createdAt: now.toISOString(),
      expiresAt: exp.toISOString(),
    });
    audit(user.id, "login", "session", user.id);
    await persistPlatform();
    (await cookies()).set(COOKIE, raw, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: exp,
    });
    return NextResponse.json({ user: safeUser(user) });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      { error: "Sign in is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
