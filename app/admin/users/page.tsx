"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
export default function Users() {
  const [rows, setRows] = useState<any[]>([]),
    [q, setQ] = useState("");
  const load = () =>
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setRows);
  useEffect(() => {
    void load();
  }, []);
  async function patch(id: string, b: any) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...b }),
    });
    load();
  }
  const show = rows.filter((x) =>
    (x.name + x.email + x.username).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <AdminShell>
      <AdminHeader
        eyebrow="ACCESS & ACCOUNTS"
        title="User management"
        description="Review accounts, roles and platform access."
        action={
          <input
            className="adminSearch"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users…"
          />
        }
      />
      <div className="adminTable">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Profile</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {show.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.name}</b>
                  <small>
                    @{u.username} · {u.email}
                  </small>
                </td>
                <td>{u.profileType}</td>
                <td>
                  <select
                    value={u.role}
                    disabled={u.protected}
                    onChange={(e) => patch(u.id, { role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="support_admin">Support Administrator</option>
                    <option value="finance_admin">Finance Administrator</option>
                    <option value="system_admin">System Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                    <option value="global_super_admin">
                      Global Super Administrator
                    </option>
                  </select>
                </td>
                <td>
                  <span className={`status ${u.status}`}>{u.status}</span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="tableBtn"
                    disabled={u.protected}
                    onClick={() =>
                      patch(u.id, {
                        status: u.status === "active" ? "suspended" : "active",
                      })
                    }
                  >
                    {u.protected
                      ? "Protected"
                      : u.status === "active"
                        ? "Suspend"
                        : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
