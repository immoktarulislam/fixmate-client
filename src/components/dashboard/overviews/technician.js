"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, IndianRupee, Wrench, CheckCircle2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/utils";
import { StatusBadge, ApprovalBadge, PaymentBadge } from "@/components/badges";
import StatsCard from "@/components/stats-card";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import EmptyState from "@/components/empty-state";
import { BarStats, DonutStats } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS } from "@/lib/constants";

const STATUSES = ["requested", "accepted", "in-progress", "completed", "rejected", "cancelled"];

export default function TechnicianOverview() {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, b] = await Promise.all([
        api("/services/mine"),
        api("/bookings/technician"),
      ]);
      setServices(s.services || []);
      setBookings(b.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <DashboardSkeleton />;

  const pending = services.filter((s) => s.approvalStatus === "pending");
  const approved = services.filter((s) => s.approvalStatus === "approved");
  const incoming = bookings.filter((b) => b.status === "requested");
  const earned = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.finalAmount || b.basePrice || 0), 0);

  const statusData = STATUSES.map((s) => ({
    name: STATUS_LABELS[s] || s,
    value: bookings.filter((b) => b.status === s).length,
  })).filter((d) => d.value > 0);

  const approvalData = ["approved", "pending", "rejected"].map((s) => ({
    name: s[0].toUpperCase() + s.slice(1),
    value: services.filter((x) => x.approvalStatus === s).length,
  })).filter((d) => d.value > 0);

  const incomingList = incoming.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technician dashboard"
        description="Publish services, respond to requests and keep your earnings in view."
        actions={
          <Button asChild>
            <Link href="/dashboard/technician/add-service">
              <Wrench className="mr-2 h-4 w-4" /> Add service
            </Link>
          </Button>
        }
      />

      <ErrorNote message={error} onRetry={load} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Wrench} label="My services" value={services.length} hint={`${approved.length} approved`} tone="teal" />
        <StatsCard icon={Inbox} label="Incoming requests" value={incoming.length} hint="Waiting for a response" tone="amber" />
        <StatsCard icon={CheckCircle2} label="Jobs done" value={bookings.filter((b) => b.status === "completed").length} tone="green" />
        <StatsCard icon={IndianRupee} label="Earned" value={formatMoney(earned)} hint="Paid bookings" tone="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Jobs by status</h2>
          {statusData.length ? (
            <DonutStats data={statusData} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">No jobs yet.</p>
          )}
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Service approvals</h2>
          {approvalData.length ? (
            <BarStats data={approvalData} xKey="name" yKey="value" />
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">No services yet.</p>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Waiting for your response</h2>
            <Link
              href="/dashboard/technician/requests"
              className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              All requests <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {incomingList.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No pending requests"
              description="New customer requests for your services will appear here."
              actionLabel="My services"
              actionHref="/dashboard/technician/services"
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {incomingList.map((b) => (
                <li key={b._id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {b.serviceTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {b.customerName} · {formatDate(b.preferredDate)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Service status</h2>
          {services.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No services"
              description="Publish your first service to start receiving jobs."
              actionLabel="Add service"
              actionHref="/dashboard/technician/add-service"
            />
          ) : (
            <ul className="space-y-3">
              {services.slice(0, 5).map((s) => (
                <li key={s._id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-slate-700 dark:text-slate-200">{s.title}</span>
                  <ApprovalBadge status={s.approvalStatus} />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/technician/services">
                Manage services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {pending.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pending.length} service{pending.length === 1 ? "" : "s"} awaiting admin approval.
              </p>
            )}
          </div>
        </Panel>
      </div>

      {bookings.some((b) => b.paymentStatus === "paid") && (
        <Panel>
          <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Recent paid jobs</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookings
              .filter((b) => b.paymentStatus === "paid")
              .slice(0, 5)
              .map((b) => (
                <li key={b._id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {b.serviceTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {b.customerName} · {formatDate(b.preferredDate)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {formatMoney(b.finalAmount || b.basePrice)}
                  </span>
                  <PaymentBadge status={b.paymentStatus} />
                  <StatusBadge status={b.status} />
                </li>
              ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
