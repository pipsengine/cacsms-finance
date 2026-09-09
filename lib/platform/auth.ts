import { cookies } from "next/headers";
import { db, tokenHash } from "./store";
import { User } from "@/lib/types/platform";
export const COOKIE = "cacsms_session";
export async function currentUser(): Promise<User | null> {
  const c = await cookies();
  const raw = c.get(COOKIE)?.value;
  if (!raw) return null;
  const s = db().sessions.find(
    (x) => x.tokenHash === tokenHash(raw) && new Date(x.expiresAt) > new Date(),
  );
  if (!s) return null;
  return (
    db().users.find((x) => x.id === s.userId && x.status === "active") || null
  );
}
export const safeUser = (u: User) => {
  const { passwordHash, passwordSalt, ...safe } = u;
  return { ...safe, protected: isProtectedUser(u) };
};
export const isProtectedUser = (u: User | null | undefined) =>
  !!u &&
  (u.id === "USR-GLOBAL-CACSMS" || u.username.toLowerCase() === "cacsms");
export const isAdmin = (u: User | null) =>
  !!u &&
  [
    "support_admin",
    "finance_admin",
    "system_admin",
    "super_admin",
    "global_super_admin",
  ].includes(u.role);
