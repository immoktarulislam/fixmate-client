"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
        <XCircle className="size-7" />
      </span>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">
        Checkout cancelled
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        No money was taken. Your booking stays <strong>completed</strong> and
        <strong> unpaid</strong> — you can pay whenever you are ready.
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/dashboard/customer/bookings">
            <RefreshCcw className="mr-2 h-4 w-4" /> Try again
          </Link>
        </Button>
      </div>
    </div>
  );
}
