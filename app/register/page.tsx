"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export default function Register() {
  const r = useRouter(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f)),
      });
      const text = await res.text();
      let data: { error?: string } = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }
      if (!res.ok) {
        setError(
          data.error ||
            "Registration is temporarily unavailable. Please try again.",
        );
        return;
      }
      r.replace("/");
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
        <p>Start with 14 days of Business intelligence</p>
        <div className="authValue">
          <b>Record. Understand. Improve.</b>
          <span>Your account starts on a complimentary Business trial.</span>
        </div>
      </section>
      <section className="authPanel">
        <form className="authCard" onSubmit={submit}>
          <span className="eyebrow">CREATE ACCOUNT</span>
          <h2>Start understanding your money</h2>
          {error && <div className="formError">{error}</div>}
          <div className="formGrid">
            <label>
              Full name
              <input name="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Username
              <input
                name="username"
                minLength={3}
                maxLength={32}
                pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,31}"
                autoComplete="username"
                required
              />
            </label>
            <label>
              Phone
              <input name="phone" />
            </label>
            <label>
              Profile
              <select name="profileType" defaultValue="individual">
                <option value="individual">Individual</option>
                <option value="trader">Trader</option>
                <option value="freelancer">Freelancer</option>
                <option value="household">Household</option>
                <option value="business">Business</option>
              </select>
            </label>
          </div>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>
          <button className="primaryBtn" disabled={busy}>
            {busy ? "Creating…" : "Create my account"}
          </button>
          <div className="authSwitch">
            Already registered? <Link href="/login">Sign in</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
