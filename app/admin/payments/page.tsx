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
export default function Payments() {
  const [rows, setRows] = useState<any[]>([]),
    [users, setUsers] = useState<any[]>([]),
    [open, setOpen] = useState(false);
  const load = () =>
    Promise.all([
      fetch("/api/admin/payments").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]).then(([a, b]) => {
      setRows(a);
      setUsers(b);
    });
  useEffect(() => {
    void load();
  }, []);
  async function add(e: any) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setOpen(false);
    load();
  }
  return (
    <AdminShell>
      <AdminHeader
        eyebrow="REVENUE CONTROL"
        title="Payments"
        description="Record and review subscription payments, including bank transfers and manual collections."
        action={
          <button className="primaryBtn compact" onClick={() => setOpen(true)}>
            + Record payment
          </button>
        }
      />
      <div className="adminTable">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{p.reference}</b>
                  <small>{p.id}</small>
                </td>
                <td>
                  {users.find((u) => u.id === p.userId)?.name || p.userId}
                </td>
                <td>{money(p.amount)}</td>
                <td>{p.method}</td>
                <td>
                  <span className={`status ${p.status}`}>{p.status}</span>
                </td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="modalBackdrop">
          <form className="modal" onSubmit={add}>
            <div className="modalHead">
              <h3>Record payment</h3>
              <button type="button" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <label>
              User
              <select name="userId">
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
            </label>
            <div className="formGrid">
              <label>
                Amount ₦<input name="amount" type="number" min="0" required />
              </label>
              <label>
                Method
                <select name="method">
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Paystack</option>
                  <option>Flutterwave</option>
                </select>
              </label>
              <label>
                Reference
                <input name="reference" required />
              </label>
              <label>
                Status
                <select name="status">
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </label>
            </div>
            <button className="primaryBtn">Save payment</button>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
