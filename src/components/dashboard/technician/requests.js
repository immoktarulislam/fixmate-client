"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Hammer,
  Eye,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/badges";
import StatusTimeline from "@/components/status-timeline";
import ConfirmDialog from "@/components/confirm-dialog";
import EmptyState from "@/components/empty-state";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FILTERS = ["all", "requested", "accepted", "in-progress", "completed", "rejected"];

export default function TechnicianRequests() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [completing, setCompleting] = useState(null);
  const [finalAmount, setFinalAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/bookings/technician");
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function move(booking, status, extra = {}) {
    setBusyId(booking._id);
    try {
      const data = await api(`/bookings/${booking._id}/status`, {
        method: "PATCH",
        body: { status, ...extra },
      });
      setBookings((prev) => prev.map((b) => (b._id === booking._id ? data.booking : b)));
      toast.success(`Job marked as ${status.replace("-", " ")}`);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function confirmComplete() {
    const amount = Number(finalAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setAmountError("Enter a final amount greater than 0");
      return;
    }
    setSaving(true);
    const ok = await move(completing, "completed", { finalAmount: amount });
    setSaving(false);
    if (ok) {
      setCompleting(null);
      setFinalAmount("");
      setAmountError("");
    }
  }

  function openComplete(booking) {
    setCompleting(booking);
    setFinalAmount(String(booking.basePrice || ""));
    setAmountError("");
  }

  if (loading) return <DashboardSkeleton rows={5} />;

  const visible = bookings.filter((b) => filter === "all" || b.status === filter);
  const counts = (s) => bookings.filter((b) => b.status === s).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job requests"
        description="Accept, start and complete the jobs assigned to you — one step at a time."
      />

      <ErrorNote message={error} onRetry={load} />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              filter === f
                ? "bg-teal-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            {f === "all" ? "All" : f.replace("-", " ")}
            {f !== "all" && (
              <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/15">
                {counts(f)}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing in this view"
          description="When customers book your services, their requests show up here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((b) => (
            <Panel key={b._id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                    {b.serviceTitle}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {b.customerName} · {b.customerPhone || "no phone"}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs">
                  <CalendarDays className="mr-1 h-3 w-3" /> {formatDate(b.preferredDate)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <MapPin className="mr-1 h-3 w-3" /> {b.address || "—"}
                </Badge>
                <PaymentBadge status={b.paymentStatus} />
              </div>

              {b.problemDescription && (
                <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                  {b.problemDescription}
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="mr-auto text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {b.finalAmount > 0 ? formatMoney(b.finalAmount) : formatMoney(b.basePrice)}
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    {b.finalAmount > 0 ? "final" : "estimate"}
                  </span>
                </span>

                <Button size="sm" variant="ghost" onClick={() => setDetail(b)}>
                  <Eye className="mr-1.5 h-4 w-4" /> Details
                </Button>

                {b.status === "requested" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => move(b, "accepted")}
                      disabled={busyId === b._id}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> Accept
                    </Button>
                    <ConfirmDialog
                      destructive
                      title="Reject this request?"
                      description={`${b.serviceTitle} from ${b.customerName} will be marked as rejected.`}
                      confirmLabel="Reject"
                      onConfirm={() => move(b, "rejected")}
                      trigger={
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === b._id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="mr-1.5 h-4 w-4" /> Reject
                        </Button>
                      }
                    />
                  </>
                )}

                {b.status === "accepted" && (
                  <Button size="sm" onClick={() => move(b, "in-progress")} disabled={busyId === b._id}>
                    <PlayCircle className="mr-1.5 h-4 w-4" /> Start job
                  </Button>
                )}

                {b.status === "in-progress" && (
                  <Button size="sm" onClick={() => openComplete(b)} disabled={busyId === b._id}>
                    <Hammer className="mr-1.5 h-4 w-4" /> Mark completed
                  </Button>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Details + timeline */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.serviceTitle}</DialogTitle>
                <DialogDescription>
                  {detail.customerName} · {detail.customerEmail}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={detail.status} />
                  <PaymentBadge status={detail.paymentStatus} />
                </div>
                <dl className="grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-2 dark:bg-slate-800/60">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Preferred date</dt>
                    <dd className="font-medium">{formatDate(detail.preferredDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Address</dt>
                    <dd className="font-medium">{detail.address || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Estimate</dt>
                    <dd className="font-medium">{formatMoney(detail.basePrice)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Final amount</dt>
                    <dd className="font-medium">
                      {detail.finalAmount > 0 ? formatMoney(detail.finalAmount) : "—"}
                    </dd>
                  </div>
                </dl>
                {detail.problemDescription && (
                  <div>
                    <h4 className="mb-1 font-medium">Problem description</h4>
                    <p className="text-slate-600 dark:text-slate-300">{detail.problemDescription}</p>
                  </div>
                )}
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

      {/* Completion amount (server requires finalAmount > 0) */}
      <Dialog
        open={!!completing}
        onOpenChange={(open) => !open && setCompleting(null)}
      >
        <DialogContent className="sm:max-w-md">
          {completing && (
            <>
              <DialogHeader>
                <DialogTitle>Complete “{completing.serviceTitle}”</DialogTitle>
                <DialogDescription>
                  Set the final amount the customer will pay. It can no longer change afterwards.
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label htmlFor="final-amount">Final amount (USD)</Label>
                <Input
                  id="final-amount"
                  type="number"
                  min="1"
                  step="1"
                  className="mt-1.5"
                  value={finalAmount}
                  onChange={(e) => {
                    setFinalAmount(e.target.value);
                    setAmountError("");
                  }}
                />
                {amountError && (
                  <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                    {amountError}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Estimate was {formatMoney(completing.basePrice)}.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCompleting(null)}>
                  Cancel
                </Button>
                <Button onClick={confirmComplete} disabled={saving}>
                  {saving ? "Saving…" : "Complete job"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
