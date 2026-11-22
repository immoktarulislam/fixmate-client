"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Users, Search, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { RoleBadge } from "@/components/badges";
import EmptyState from "@/components/empty-state";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import ConfirmDialog from "@/components/confirm-dialog";
import { useSession } from "@/lib/auth-client";

const ROLE_OPTIONS = ["customer", "technician", "admin"];

export default function AdminUsers() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [pendingRole, setPendingRole] = useState(null); // { user, role }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").includes(q)
    );
  }, [users, search]);

  async function changeRole() {
    if (!pendingRole) return;
    const { user, role } = pendingRole;
    setBusyId(user._id);
    try {
      const data = await api(`/admin/users/${user._id}/role`, {
        method: "PATCH",
        body: { role },
      });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? data.user : u)));
      toast.success(`${user.name || user.email} is now ${role}`);
      setPendingRole(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <DashboardSkeleton rows={6} />;

  const meId = session?.user?.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Promote technicians, grant admin access or downgrade roles instantly."
      />

      <ErrorNote message={error} onRetry={load} />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or role…"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try a different search." />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Change role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => {
                const isMe = u._id === meId;
                return (
                  <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5">
                      <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                        {u.name || "—"}
                        {isMe && (
                          <span className="rounded bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal-600 dark:text-teal-400">
                            you
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {u.area || u.phone || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          className="h-9 w-36 capitalize"
                          value={u.role}
                          disabled={isMe || busyId === u._id}
                          onChange={(e) =>
                            setPendingRole({ user: u, role: e.target.value })
                          }
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}

      <ConfirmDialog
        title="Change this user's role?"
        description={
          pendingRole
            ? `${pendingRole.user.name || pendingRole.user.email} will become "${pendingRole.role}". The change applies immediately on their next request.`
            : ""
        }
        confirmLabel="Change role"
        open={!!pendingRole}
        onOpenChange={(open) => !open && setPendingRole(null)}
        onConfirm={changeRole}
        trigger={null}
      />

      <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Roles are re-read from the database on every API request — no re-login needed.
      </p>
    </div>
  );
}
