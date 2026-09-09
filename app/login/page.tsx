"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          identifier: form.get("identifier"),
          password: form.get("password"),
        }),
      });
      const text = await response.text();
      let data: { error?: string } = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }
      if (!response.ok) {
        setError(
          data.error || "Sign in is temporarily unavailable. Please try again.",
        );
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(
        next?.startsWith("/") && !next.startsWith("//") ? next : "/",
      );
    } catch {
      setError(
        "Unable to reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="authPage">
      <section className="authBrand">
        <div className="brandMark big">C</div>
        <h1>Cacsms Finance</h1>
        <p>Your AI Money Intelligence</p>
        <div className="authValue">
          <b>Know where your money goes.</b>
          <span>Understand what it means. See what deserves attention.</span>
        </div>
      </section>
      <section className="authPanel">
        <form className="authCard" onSubmit={submit}>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to Cacsms Finance</h2>
          <p>Continue to your financial intelligence dashboard.</p>
          {error && <div className="formError">{error}</div>}
          <label>
            Email or username
            <input
              name="identifier"
              autoComplete="username"
              required
              placeholder="you@example.com or username"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </label>
          <button className="primaryBtn" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div className="authSwitch">
            New to Cacsms Finance? <Link href="/register">Create account</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
