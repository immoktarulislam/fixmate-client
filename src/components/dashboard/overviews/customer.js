"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CircleDollarSign, Clock3, Wrench, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/badges";
import StatsCard from "@/components/stats-card";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";

const ACTIVE = ["requested", "accepted", "in-progress"];

export default function CustomerOverview() {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [b, p] = await Promise.all([
        api("/bookings/my"),
        api("/payments/mine"),
      ]);
      setBookings(b.bookings || []);
      setPayments(p.payments || []);
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

  const active = bookings.filter((b) => ACTIVE.includes(b.status));
  const completed = bookings.filter((b) => b.status === "completed");
  const spent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const recent = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your repair dashboard"
        description="Track requests, approve jobs and pay only after the repair is done."
        actions={
          <Button asChild>
            <Link href="/services">
              <Wrench className="mr-2 h-4 w-4" /> Book a service
            </Link>
          </Button>
        }
      />

      <ErrorNote message={error} onRetry={load} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={CalendarCheck} label="Total bookings" value={bookings.length} tone="teal" />
        <StatsCard icon={Clock3} label="Active jobs" value={active.length} hint="Awaiting or in repair" tone="amber" />
        <StatsCard icon={Wrench} label="Completed" value={completed.length} tone="green" />
        <StatsCard
          icon={CircleDollarSign}
          label="Total paid"
          value={formatMoney(spent)}
          hint={`${payments.length} transaction${payments.length === 1 ? "" : "s"}`}
          tone="blue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Recent bookings</h2>
            <Link
              href="/dashboard/customer/bookings"
              className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No bookings yet"
              description="Book your first repair and it will show up here."
              actionLabel="Browse services"
              actionHref="/services"
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((b) => (
                <li key={b._id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {b.serviceTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(b.preferredDate)} · {b.technicianName || "Assigning technician"}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                  {b.paymentStatus === "paid" && <PaymentBadge status="paid" />}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Next steps</h2>
          <ul className="space-y-3 text-sm">
            <li className="rounded-lg bg-teal-50 p-3 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
              Paying is only possible once a technician marks the job{" "}
              <span className="font-semibold">completed</span>.
            </li>
            <li className="rounded-lg bg-slate-50 p-3 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              You can cancel a job while it is still <span className="font-semibold">requested</span>.
            </li>
            <li className="rounded-lg bg-amber-50 p-3 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Rate the technician after payment to help the community.
            </li>
          </ul>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link href="/dashboard/customer/bookings">
              Manage bookings <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
