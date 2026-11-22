"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Users, ShieldCheck, CalendarCheck, IndianRupee, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/utils";
import { StatusBadge, RoleBadge, ApprovalBadge } from "@/components/badges";
import StatsCard from "@/components/stats-card";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import { BarStats, DonutStats } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS } from "@/lib/constants";

const STATUSES = ["requested", "accepted", "in-progress", "completed", "rejected", "cancelled"];

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, b, svc] = await Promise.all([
        api("/admin/stats"),
        api("/admin/bookings"),
        api("/admin/services?approvalStatus=pending"),
      ]);
      setStats(s);
      setBookings(b.bookings || []);
      setPending(svc.services || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !stats) return <DashboardSkeleton />;

  const statusData = STATUSES.map((s) => ({
    name: STATUS_LABELS[s] || s,
    value: bookings.filter((b) => b.status === s).length,
  })).filter((d) => d.value > 0);

  const roleData = [
    { name: "Customers", value: stats.totalCustomers || 0 },
    { name: "Technicians", value: stats.totalTechnicians || 0 },
  ].filter((d) => d.value > 0);

  const recent = bookings.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Moderation queue, booking volume and revenue across FixMate."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/services">
              Moderation queue <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <ErrorNote message={error} onRetry={load} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Users} label="Users" value={stats.totalUsers} hint={`${stats.totalCustomers} customers · ${stats.totalTechnicians} technicians`} tone="teal" />
        <StatsCard icon={ShieldCheck} label="Services" value={stats.totalServices} hint={`${stats.pendingServices} awaiting approval`} tone="amber" />
        <StatsCard icon={CalendarCheck} label="Bookings" value={stats.totalBookings} hint={`${stats.activeBookings} active now`} tone="blue" />
        <StatsCard icon={IndianRupee} label="Revenue" value={formatMoney(stats.totalRevenue)} hint={`${stats.totalPayments} payments`} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Bookings by status</h2>
          {statusData.length ? (
            <BarStats data={statusData} xKey="name" yKey="value" />
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">No bookings yet.</p>
          )}
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Users by role</h2>
          {roleData.length ? (
            <DonutStats data={roleData} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">No users yet.</p>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Latest bookings</h2>
            <Link
              href="/dashboard/admin/bookings"
              className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              All bookings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                  <th className="py-2 pr-3 font-medium">Service</th>
                  <th className="py-2 pr-3 font-medium">Customer</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recent.map((b) => (
                  <tr key={b._id}>
                    <td className="max-w-[220px] truncate py-2.5 pr-3 font-medium text-slate-700 dark:text-slate-200">
                      {b.serviceTitle}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{b.customerName}</td>
                    <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{formatDate(b.preferredDate)}</td>
                    <td className="py-2.5"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Needs approval</h2>
            <Link
              href="/dashboard/admin/services"
              className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              Review <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Queue is clear 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {pending.slice(0, 6).map((s) => (
                <li key={s._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{s.title}</p>
                    <p className="truncate text-xs text-slate-500">{s.technicianName}</p>
                  </div>
                  <ApprovalBadge status={s.approvalStatus} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Role distribution snapshot</h2>
          <Link
            href="/dashboard/admin/users"
            className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            Manage users <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          <RoleBadge role="customer" />
          <RoleBadge role="technician" />
          <RoleBadge role="admin" />
        </div>
      </Panel>
    </div>
  );
}
