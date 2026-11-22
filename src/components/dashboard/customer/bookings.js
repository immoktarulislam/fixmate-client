"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarCheck,
  MapPin,
  Wrench,
  XCircle,
  CreditCard,
  Star,
  Eye,
  CalendarDays,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/badges";
import StatusTimeline from "@/components/status-timeline";
import ConfirmDialog from "@/components/confirm-dialog";
import EmptyState from "@/components/empty-state";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const FILTERS = ["all", "active", "completed", "paid", "closed"];

function matchesFilter(b, filter) {
  if (filter === "all") return true;
  if (filter === "active") return ["requested", "accepted", "in-progress"].includes(b.status);
  if (filter === "completed") return b.status === "completed";
  if (filter === "paid") return b.paymentStatus === "paid";
  if (filter === "closed") return ["rejected", "cancelled"].includes(b.status);
  return true;
}

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [savingRating, setSavingRating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/bookings/my");
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

  async function cancelBooking(booking) {
    setBusyId(booking._id);
    try {
      const data = await api(`/bookings/${booking._id}/cancel`, { method: "PATCH" });
      setBookings((prev) => prev.map((b) => (b._id === booking._id ? data.booking : b)));
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function startPayment(booking) {
    setBusyId(booking._id);
    try {
      const data = await api("/payments/create-checkout-session", {
        method: "POST",
        body: { bookingId: booking._id },
      });
      if (data.url) window.location.assign(data.url);
    } catch (err) {
      toast.error(err.message);
      setBusyId(null);
    }
  }

  async function submitRating() {
    if (!ratingTarget) return;
    setSavingRating(true);
    try {
      const data = await api(`/bookings/${ratingTarget._id}/rating`, {
        method: "PATCH",
        body: { rating, review: review.trim() },
      });
      setBookings((prev) => prev.map((b) => (b._id === ratingTarget._id ? data.booking : b)));
      toast.success("Thanks for your feedback!");
      setRatingTarget(null);
      setReview("");
      setRating(5);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingRating(false);
    }
  }

  if (loading) return <DashboardSkeleton rows={6} />;

  const visible = bookings.filter((b) => matchesFilter(b, filter));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My bookings"
        description="Every repair request you have made, with its live status."
        actions={
          <Button asChild>
            <Link href="/services">
              <Wrench className="mr-2 h-4 w-4" /> New booking
            </Link>
          </Button>
        }
      />

      <ErrorNote message={error} onRetry={load} />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition ${
              filter === f
                ? "bg-teal-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings in this view"
          description="Try another filter, or book a new repair."
          actionLabel="Browse services"
          actionHref="/services"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((b) => {
            const canCancel = b.status === "requested";
            const canPay = b.status === "completed" && b.paymentStatus === "unpaid";
            const canRate = b.paymentStatus === "paid" && !b.rating;
            return (
              <Panel key={b._id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug text-slate-800 dark:text-slate-100">
                    {b.serviceTitle}
                  </h3>
                  <StatusBadge status={b.status} />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    <CalendarDays className="mr-1 h-3 w-3" /> {formatDate(b.preferredDate)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="mr-1 h-3 w-3" /> {b.address || "—"}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Technician: <span className="font-medium">{b.technicianName || "unassigned"}</span>
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {formatMoney(b.finalAmount || b.basePrice)}
                    </span>
                    {b.finalAmount > 0 && b.finalAmount !== b.basePrice && (
                      <span className="ml-1 text-xs text-slate-400 line-through">
                        {formatMoney(b.basePrice)}
                      </span>
                    )}
                  </div>
                  <PaymentBadge status={b.paymentStatus} />
                </div>

                {b.rating && (
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < b.rating ? "fill-amber-500" : "text-slate-300 dark:text-slate-600"}`}
                      />
                    ))}
                    <span className="ml-1 text-slate-500">your review</span>
                  </div>
                )}

                <div className="mt-auto flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setDetail(b)}>
                    <Eye className="mr-1.5 h-4 w-4" /> Details
                  </Button>

                  {canPay && (
                    <Button
                      size="sm"
                      onClick={() => startPayment(b)}
                      disabled={busyId === b._id}
                    >
                      <CreditCard className="mr-1.5 h-4 w-4" />
                      {busyId === b._id ? "Redirecting…" : "Pay now"}
                    </Button>
                  )}

                  {canRate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRatingTarget(b);
                        setRating(5);
                        setReview(b.review || "");
                      }}
                    >
                      <Star className="mr-1.5 h-4 w-4" /> Rate
                    </Button>
                  )}

                  {canCancel && (
                    <ConfirmDialog
                      destructive
                      title="Cancel this booking?"
                      description={`${b.serviceTitle} on ${formatDate(b.preferredDate)} will be cancelled. This cannot be undone.`}
                      confirmLabel="Cancel booking"
                      onConfirm={() => cancelBooking(b)}
                      trigger={
                        <Button size="sm" variant="ghost" disabled={busyId === b._id} className="text-red-600 hover:text-red-700">
                          <XCircle className="mr-1.5 h-4 w-4" /> Cancel
                        </Button>
                      }
                    />
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      {/* Details + status history (optional requirement #3) */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.serviceTitle}</DialogTitle>
                <DialogDescription>
                  Booked {formatDate(detail.createdAt || detail.preferredDate)}
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
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Technician</dt>
                    <dd className="font-medium">{detail.technicianName || "unassigned"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Address</dt>
                    <dd className="font-medium">{detail.address || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Amount</dt>
                    <dd className="font-medium">
                      {formatMoney(detail.finalAmount || detail.basePrice)}
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

      {/* Rate & review (optional requirement #2) */}
      <Dialog open={!!ratingTarget} onOpenChange={(open) => !open && setRatingTarget(null)}>
        <DialogContent className="sm:max-w-md">
          {ratingTarget && (
            <>
              <DialogHeader>
                <DialogTitle>Rate “{ratingTarget.serviceTitle}”</DialogTitle>
                <DialogDescription>
                  Your review helps other customers pick the right technician.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n} star`}
                      onClick={() => setRating(n)}
                    >
                      <Star
                        className={`h-8 w-8 transition ${
                          n <= rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-slate-300 hover:text-amber-400 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="review">
                    Review (optional)
                  </label>
                  <Textarea
                    id="review"
                    rows={4}
                    maxLength={500}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="How was the repair experience?"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">{review.length}/500</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setRatingTarget(null)}>
                  Later
                </Button>
                <Button onClick={submitRating} disabled={savingRating}>
                  {savingRating ? "Saving…" : "Submit review"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
