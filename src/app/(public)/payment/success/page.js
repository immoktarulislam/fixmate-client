"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Download, ArrowRight } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { downloadInvoice } from "@/lib/invoice";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id") || params.get("sessionKey") || "";
  const [state, setState] = useState({ phase: "verifying", data: null, message: "" });
  const ran = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setState({ phase: "error", data: null, message: "Missing payment session." });
      return;
    }
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const data = await api(`/payments/verify?session_id=${encodeURIComponent(sessionId)}`);
        if (data.verified) {
          setState({ phase: "done", data, message: "" });
        } else {
          setState({
            phase: "pending",
            data: null,
            message: data.message || "Payment has not completed yet.",
          });
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Not signed in - Stripe already took the money; let them log in to see it.
          setState({
            phase: "unauth",
            data: null,
            message: "Sign in to see this payment recorded.",
          });
          return;
        }
        setState({ phase: "error", data: null, message: err.message });
      }
    })();
  }, [sessionId]);

  if (state.phase === "verifying") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <Spinner className="h-9 w-9 text-teal-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Confirming your payment with Stripe…
        </p>
      </div>
    );
  }

  if (state.phase === "done") {
    const { payment, booking } = state.data;
    return (
      <>
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-50">
          Payment successful
        </h1>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {state.data.alreadyRecorded
            ? "This payment was already recorded — no double charge."
            : "Your payment has been recorded for this repair."}
        </p>

        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Service</span>
            <span className="text-right font-medium">{booking?.serviceTitle || payment?.serviceTitle}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Amount</span>
            <span className="font-semibold">{formatMoney(payment?.amount)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Booking status</span>
            <StatusBadge status={booking?.status || "completed"} />
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Payment</span>
            <PaymentBadge status={payment?.paymentStatus || "paid"} />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => payment && downloadInvoice(payment)}
            variant="outline"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" /> Download invoice
          </Button>
          <Button asChild className="flex-1">
            <Link href="/dashboard/customer/bookings">
              View booking <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Tip: rate the technician from your bookings page to help others.
        </p>
      </>
    );
  }

  const tone =
    state.phase === "pending" ? "text-amber-500" : "text-red-500";
  const Icon = state.phase === "pending" ? Loader2 : XCircle;

  return (
    <>
      <span className={`mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ${tone}`}>
        <Icon className={`size-7 ${state.phase === "pending" ? "animate-spin" : ""}`} />
      </span>
      <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-50">
        {state.phase === "pending" ? "Payment processing" : "Payment not completed"}
      </h1>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {state.message ||
          (state.phase === "unauth"
            ? "Sign in to view the receipt."
            : "You were not charged. Please try again.")}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/dashboard/customer">Go to dashboard</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/dashboard/customer/bookings">My bookings</Link>
        </Button>
      </div>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 py-10">
            <Spinner className="h-9 w-9 text-teal-600" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
