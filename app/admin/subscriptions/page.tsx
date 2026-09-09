"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
const money = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
export default function Subs() {
  const [rows, setRows] = useState<any[]>([]),
    [users, setUsers] = useState<any[]>([]),
    [plans, setPlans] = useState<any[]>([]),
    [open, setOpen] = useState(false);
  const load = () =>
    Promise.all([
      fetch("/api/admin/subscriptions").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/plans").then((r) => r.json()),
    ]).then(([a, b, c]) => {
      setRows(a);
      setUsers(b);
      setPlans(c);
    });
  useEffect(() => {
    void load();
  }, []);
  async function add(e: any) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      body = Object.fromEntries(f);
    await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setOpen(false);
    load();
  }
  async function cancel(id: string) {
    await fetch("/api/admin/subscriptions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: "cancelled" }),
    });
    load();
  }
  return (
    <AdminShell>
      <AdminHeader
        eyebrow="BILLING LIFECYCLE"
        title="Subscriptions"
        description="Activate, extend or cancel customer access, including manual/offline subscriptions."
        action={
          <button className="primaryBtn compact" onClick={() => setOpen(true)}>
            + New subscription
          </button>
        }
      />
      <div className="adminTable">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Cycle</th>
              <th>Amount</th>
              <th>Renews / ends</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>
                  <b>{s.user}</b>
                  <small>{s.userId}</small>
                </td>
                <td>{s.plan}</td>
                <td>
                  <span className={`status ${s.status}`}>{s.status}</span>
                </td>
                <td>{s.billingCycle}</td>
                <td>{money(s.amount)}</td>
                <td>{new Date(s.renewsAt).toLocaleDateString()}</td>
                <td>
                  {["active", "trialing"].includes(s.status) && (
                    <button
                      className="tableBtn danger"
                      onClick={() => cancel(s.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="modalBackdrop">
          <form className="modal" onSubmit={add}>
            <div className="modalHead">
              <h3>Create subscription</h3>
              <button type="button" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <label>
              Customer
              <select name="userId" required>
                {users
                  .filter((u) => u.role === "user")
                  .map((u) => (
                    <option value={u.id} key={u.id}>
                      {u.name} — {u.email}
                    </option>
                  ))}
              </select>
            </label>
            <div className="formGrid">
              <label>
                Plan
                <select name="planCode">
                  {plans
                    .filter((p) => p.active)
                    .map((p) => (
                      <option value={p.code} key={p.code}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Billing cycle
                <select name="billingCycle">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="manual">Manual</option>
                </select>
              </label>
              <label>
                Months
                <input name="months" type="number" min="1" defaultValue="1" />
              </label>
              <label>
                Source
                <select name="source">
                  <option value="admin_manual">Admin manual</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="promotion">Promotion</option>
                  <option value="complimentary">Complimentary</option>
                </select>
              </label>
            </div>
            <button className="primaryBtn">Activate subscription</button>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
