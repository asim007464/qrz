"use client";

import { useMemo, useState } from "react";
import { adminFetch, useAdminData } from "@/components/admin/useAdminData";
import { fmtUTC } from "@/lib/utils";

const ROLES = ["member", "staff", "admin"] as const;
const PER_PAGE = 10;

export default function AdminUsersPage() {
  const { data, loading, refresh } = useAdminData();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [blockedFilter, setBlockedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.callsign?.toLowerCase().includes(q) ||
        u.last_ip?.toLowerCase().includes(q) ||
        u.last_ip_location?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.country?.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesBlocked =
        blockedFilter === "all" ||
        (blockedFilter === "blocked" && u.is_blocked) ||
        (blockedFilter === "active" && !u.is_blocked);
      return matchesSearch && matchesRole && matchesBlocked;
    });
  }, [data, search, roleFilter, blockedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function updateUser(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    const res = await adminFetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok) alert(result.error || "Update failed");
    await refresh();
    setBusyId("");
  }

  if (loading) return <p className="section-sub">Loading users…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Users and roles</h1>
          <p className="section-sub">{filtered.length} users shown</p>
        </div>
      </div>

      <div className="admin-filters panel">
        <input
          className="admin-filter-input no-cap"
          placeholder="Search name, email, callsign, IP…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="all">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={blockedFilter} onChange={(e) => { setBlockedFilter(e.target.value); setPage(1); }}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {data && (
        <div className="panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Callsign</th>
                <th>Email</th>
                <th>IP Address</th>
                <th>IP Location</th>
                <th>Profile Location</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((u) => {
                const profileLocation = [u.location, u.country].filter(Boolean).join(", ") || "—";
                return (
                <tr key={u.id}>
                  <td>{u.name || "—"}</td>
                  <td className="no-cap">{u.callsign || "—"}</td>
                  <td className="no-cap">{u.email}</td>
                  <td className="no-cap" title={u.signup_ip ? `Signup IP: ${u.signup_ip}` : undefined}>
                    {u.last_ip || u.signup_ip || "—"}
                  </td>
                  <td className="no-cap">{u.last_ip_location || "—"}</td>
                  <td className="no-cap">{profileLocation}</td>
                  <td>
                    <select
                      className="admin-inline-select"
                      value={u.role}
                      disabled={busyId === u.id || (u.role === "admin" && !data.session.isSuperAdmin)}
                      onChange={(e) => updateUser(u.id, { role: e.target.value })}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} disabled={r === "admin" && !data.session.isSuperAdmin}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="no-cap">{u.created_at ? fmtUTC(u.created_at) : "—"}</td>
                  <td>
                    <span className={`support-status support-status--${u.is_blocked ? "open" : "resolved"}`}>
                      {u.is_blocked ? "blocked" : "active"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busyId === u.id}
                      onClick={() => updateUser(u.id, { is_blocked: !u.is_blocked })}
                    >
                      {u.is_blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
          <div className="admin-pagination">
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}
      {!data?.session.isSuperAdmin && (
        <p className="auth-hint" style={{ marginTop: 12, textAlign: "left" }}>
          Only the developer super-admin can promote users to admin.
        </p>
      )}
    </div>
  );
}
