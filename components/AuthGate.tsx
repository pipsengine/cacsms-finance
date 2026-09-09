"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
export default function AuthGate({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const r = useRouter(),
    p = usePathname(),
    [ok, setOk] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" }).then(async (x) => {
      if (!x.ok) {
        r.replace("/login?next=" + encodeURIComponent(p));
        return;
      }
      const d = await x.json();
      if (
        admin &&
        ![
          "support_admin",
          "finance_admin",
          "system_admin",
          "super_admin",
          "global_super_admin",
        ].includes(d.user.role)
      ) {
        r.replace("/");
        return;
      }
      setOk(true);
    });
  }, [admin, p, r]);
  if (!ok) return <div className="authLoading">Loading Cacsms Finance…</div>;
  return <>{children}</>;
}
