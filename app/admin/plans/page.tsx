"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
export default function Plans() {
  const [rows, setRows] = useState<any[]>([]),
    [editing, setEditing] = useState<any>(null);
  const load = () =>
    fetch("/api/admin/plans")
      .then((r) => r.json())
      .then(setRows);
  useEffect(() => {
    void load();
  }, []);
  async function save(e: any) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      b: any = { code: editing.code };
    for (const k of [
      "name",
      "monthlyPrice",
      "yearlyPrice",
      "trialDays",
      "aiQuota",
      "transactionLimit",
      "accountLimit",
    ])
      b[k] = k === "name" ? f.get(k) : Number(f.get(k));
    b.description = f.get("description");
    b.active = f.get("active") === "on";
    await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(b),
    });
    setEditing(null);
    load();
  }
  return (
    <AdminShell>
      <AdminHeader
        eyebrow="COMMERCIAL CONTROL"
        title="Plans & pricing"
        description="Prices and limits are configurable from the admin end; nothing is hard-coded in the customer UI."
      />
      <section className="adminPlanGrid">
        {rows.map((p) => (
          <article className="adminPlan" key={p.code}>
            <div>
              <span className="eyebrow">{p.code}</span>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
            </div>
            <div className="pricePair">
              <b>
                ₦{p.monthlyPrice.toLocaleString()}
                <small>/mo</small>
              </b>
              <b>
                ₦{p.yearlyPrice.toLocaleString()}
                <small>/yr</small>
              </b>
            </div>
            <div className="planMeta">
              <span>
                AI quota <b>{p.aiQuota}</b>
              </span>
              <span>
                Accounts{" "}
                <b>{p.accountLimit === -1 ? "Unlimited" : p.accountLimit}</b>
              </span>
              <span>
                Trial <b>{p.trialDays} days</b>
              </span>
            </div>
            <button className="tableBtn" onClick={() => setEditing(p)}>
              Edit plan
            </button>
          </article>
        ))}
      </section>
      {editing && (
        <div className="modalBackdrop">
          <form className="modal planEdit" onSubmit={save}>
            <div className="modalHead">
              <h3>Edit {editing.name}</h3>
              <button type="button" onClick={() => setEditing(null)}>
                ×
              </button>
            </div>
            <div className="formGrid">
              <label>
                Name
                <input name="name" defaultValue={editing.name} />
              </label>
              <label>
                Monthly ₦
                <input
                  name="monthlyPrice"
                  type="number"
                  defaultValue={editing.monthlyPrice}
                />
              </label>
              <label>
                Yearly ₦
                <input
                  name="yearlyPrice"
                  type="number"
                  defaultValue={editing.yearlyPrice}
                />
              </label>
              <label>
                Trial days
                <input
                  name="trialDays"
                  type="number"
                  defaultValue={editing.trialDays}
                />
              </label>
              <label>
                AI quota
                <input
                  name="aiQuota"
                  type="number"
                  defaultValue={editing.aiQuota}
                />
              </label>
              <label>
                Transaction limit
                <input
                  name="transactionLimit"
                  type="number"
                  defaultValue={editing.transactionLimit}
                />
              </label>
              <label>
                Account limit
                <input
                  name="accountLimit"
                  type="number"
                  defaultValue={editing.accountLimit}
                />
              </label>
            </div>
            <label>
              Description
              <textarea name="description" defaultValue={editing.description} />
            </label>
            <label className="check">
              <input
                name="active"
                type="checkbox"
                defaultChecked={editing.active}
              />{" "}
              Plan is active
            </label>
            <button className="primaryBtn">Save changes</button>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
