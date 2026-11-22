"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Download, Receipt } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { PaymentBadge } from "@/components/badges";
import EmptyState from "@/components/empty-state";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { downloadInvoice } from "@/lib/invoice";

export default function CustomerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/payments/mine");
      setPayments(data.payments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <DashboardSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Pay after the repair is completed — every transaction in one place."
      />

      <ErrorNote message={error} onRetry={load} />

      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="You will be able to pay here once a technician completes a job."
          actionLabel="Browse services"
          actionHref="/services"
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Technician</th>
                <th className="px-5 py-3 font-medium">Paid on</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="max-w-[220px] truncate px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                    {p.serviceTitle || "Repair service"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {p.technicianName || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {formatDateTime(p.paidAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <PaymentBadge status={p.paymentStatus} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-100">
                    {formatMoney(p.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadInvoice(p)}
                      title="Download PDF invoice"
                    >
                      <Download className="mr-1.5 h-4 w-4" /> Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Receipt className="h-3.5 w-3.5" />
        Payments are processed securely by Stripe. FixMate never stores card details.
      </p>

      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/customer/bookings">View my bookings</Link>
        </Button>
      </div>
    </div>
  );
}
