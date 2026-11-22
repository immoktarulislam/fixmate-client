"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Search } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatMoney, formatDateTime } from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/badges";
import StatusTimeline from "@/components/status-timeline";
import EmptyState from "@/components/empty-state";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BOOKING_STATUSES, STATUS_LABELS } from "@/lib/constants";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = status ? `?status=${encodeURIComponent(status)}` : "";
      const data = await api(`/admin/bookings${qs}`);
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const q = search.trim().toLowerCase();
  const visible = q
    ? bookings.filter(
        (b) =>
          (b.serviceTitle || "").toLowerCase().includes(q) ||
          (b.customerName || "").toLowerCase().includes(q) ||
          (b.technicianName || "").toLowerCase().includes(q)
      )
    : bookings;

  return (
    <div className="space-y-6">
      <PageHeader
        title="All bookings"
        description="Read-only oversight of every job on the platform."
      />

      <ErrorNote message={error} onRetry={load} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatus("")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              status === ""
                ? "bg-teal-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            All
          </button>
          {BOOKING_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                status === s
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
              }`}
            >
              {STATUS_LABELS[s] || s}
            </button>
          ))}
        </div>

        <div className="relative lg:ml-auto lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service, customer…"
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton rows={6} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found"
          description="Try another status filter or search term."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Technician</th>
                <th className="px-5 py-3 font-medium">Visit date</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visible.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="max-w-[200px] truncate px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                    {b.serviceTitle}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    <span className="block truncate">{b.customerName}</span>
                    <span className="block truncate text-xs">{b.customerEmail}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {b.technicianName || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {formatDate(b.preferredDate)}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                    {formatMoney(b.finalAmount || b.basePrice)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <PaymentBadge status={b.paymentStatus} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setDetail(b)}>
                      History
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.serviceTitle}</DialogTitle>
                <DialogDescription>
                  Booked {formatDateTime(detail.createdAt)} by {detail.customerName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={detail.status} />
                  <PaymentBadge status={detail.paymentStatus} />
                </div>
                <p className="rounded-lg bg-slate-50 p-3 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                  {detail.problemDescription || "No problem description provided."}
                </p>
                {detail.statusHistory?.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-medium">Status history</h4>
                    <StatusTimeline history={detail.statusHistory} />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
