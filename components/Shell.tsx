"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./Icons";
import SettingsModal from "./SettingsModal";
export default function Shell({ children }: { children: React.ReactNode }) {
  const p = usePathname(),
    r = useRouter(),
    [me, setMe] = useState<any>(null),
    [clock, setClock] = useState<Date | null>(null);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((x) => (x.ok ? x.json() : null))
      .then(setMe);
  }, []);
  useEffect(() => {
    const tick = () => setClock(new Date());
    tick();
    const timer = window.setInterval(tick, 1_000);
    return () => window.clearInterval(timer);
  }, []);
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    r.replace("/login");
  }
  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">C</div>
          <div>
            <b>Cacsms</b>
            <span>Finance</span>
          </div>
        </div>
        <nav>
          <Link className={p === "/" ? "active" : ""} href="/">
            <Icon name="home" />
            Overview
          </Link>
          <Link
            className={p.startsWith("/reports") ? "active" : ""}
            href="/reports"
          >
            <Icon name="report" />
            Reports & Insights
          </Link>
          <Link
            className={p.startsWith("/pricing") ? "active" : ""}
            href="/pricing"
          >
            <Icon name="wallet" />
            Plans & Subscription
          </Link>
          {me &&
            [
              "support_admin",
              "finance_admin",
              "system_admin",
              "super_admin",
              "global_super_admin",
            ].includes(me.user?.role) && (
              <Link
                className={p.startsWith("/admin") ? "active" : ""}
                href="/admin"
              >
                <Icon name="settings" />
                Administration
              </Link>
            )}
        </nav>
        <div className="sideSpacer" />
        <div className="sideHint">
          <Icon name="spark" />
          <strong>Your AI Money Intelligence</strong>
          <p>
            Record in seconds. Understand automatically. See what deserves
            attention.
          </p>
        </div>
        <button
          className="profile"
          onClick={() => window.dispatchEvent(new Event("open-settings"))}
        >
          <span>
            {(me?.user?.name || "CF")
              .split(" ")
              .map((x: string) => x[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div>
            <b>{me?.user?.name || "Cacsms User"}</b>
            <small>{me?.plan?.name || "Finance"} plan</small>
          </div>
          <b>⋯</b>
        </button>
        <button className="logoutBtn" onClick={logout}>
          Sign out
        </button>
      </aside>
      <main>
        <header>
          <div className="mobileBrand">
            <div className="brandMark">C</div>
            <b>Cacsms Finance</b>
          </div>
          <div className="headerUtilities">
            <div
              className="liveClock"
              title={
                clock
                  ? Intl.DateTimeFormat().resolvedOptions().timeZone
                  : undefined
              }
              aria-label="Current local date and time"
            >
              <span className="clockItem">
                <small>Date</small>
                <b>
                  {clock
                    ? new Intl.DateTimeFormat(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(clock)
                    : "—"}
                </b>
              </span>
              <span className="clockDivider" />
              <span className="clockItem">
                <small>Time</small>
                <b>
                  {clock
                    ? new Intl.DateTimeFormat(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }).format(clock)
                    : "—"}
                </b>
              </span>
            </div>
            <div className="headerActions">
              <button
                aria-label="Add transaction"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("open-add-transaction", {
                      detail: { type: "income" },
                    }),
                  )
                }
              >
                <Icon name="plus" />
              </button>
              <button
                aria-label="Settings"
                onClick={() => window.dispatchEvent(new Event("open-settings"))}
              >
                <Icon name="settings" />
              </button>
            </div>
          </div>
        </header>
        {children}
      </main>
      <nav className="bottomNav">
        <Link className={p === "/" ? "active" : ""} href="/">
          <Icon name="home" />
          <span>Home</span>
        </Link>
        <button
          className="mobileAdd"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("open-add-transaction", {
                detail: { type: "income" },
              }),
            )
          }
        >
          <Icon name="plus" size={25} />
        </button>
        <Link
          className={p.startsWith("/reports") ? "active" : ""}
          href="/reports"
        >
          <Icon name="report" />
          <span>Reports</span>
        </Link>
      </nav>
      <SettingsModal />
    </div>
  );
}
