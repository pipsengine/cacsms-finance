import { hydratePlatform, persistPlatform } from "@/lib/platform/google-sync";
import { NextResponse } from "next/server";
import {
  currentUser,
  isAdmin,
  isProtectedUser,
  safeUser,
} from "@/lib/platform/auth";
import { audit, db } from "@/lib/platform/store";
export async function GET() {
  await hydratePlatform();
  const u = await currentUser();
  if (!isAdmin(u))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(db().users.map(safeUser));
}
export async function PATCH(req: Request) {
  await hydratePlatform();
  const actor = await currentUser();
  if (!isAdmin(actor))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json(),
    u = db().users.find((x) => x.id === b.id);
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (isProtectedUser(u))
    return NextResponse.json(
      { error: "The global system administrator cannot be modified." },
      { status: 403 },
    );
  if (b.status) u.status = b.status;
  if (
    b.role &&
    ["super_admin", "global_super_admin"].includes(actor?.role || "") &&
    b.role !== "global_super_admin"
  )
    u.role = b.role;
  u.updatedAt = new Date().toISOString();
  audit(
    actor!.id,
    "update_user",
    "user",
    u.id,
    JSON.stringify({ status: b.status, role: b.role }),
  );
  await persistPlatform();
  return NextResponse.json(safeUser(u));
}
