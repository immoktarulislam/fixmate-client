"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Receipt, Download, IndianRupee, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { PaymentBadge } from "@/components/badges";
import EmptyState from "@/components/empty-state";
import StatsCard from "@/components/stats-card";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { downloadInvoice } from "@/lib/invoice";

export default function AdminTransactions() {
  const [data, setData] = useState({ payments: [], totalRevenue: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api("/admin/payments");
      setData({
        payments: res.payments || [],
        totalRevenue: res.totalRevenue || 0,
        totalCount: res.totalCount || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <DashboardSkeleton rows={5} />;

  const avg = data.totalCount ? data.totalRevenue / data.totalCount : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Every Stripe payment recorded by the webhook — immutable and reconciled."
      />

      <ErrorNote message={error} onRetry={load} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard icon={IndianRupee} label="Total revenue" value={formatMoney(data.totalRevenue)} tone="green" />
        <StatsCard icon={Receipt} label="Payments" value={data.totalCount} tone="teal" />
        <StatsCard icon={CheckCircle2} label="Average ticket" value={formatMoney(avg)} tone="blue" />
      </div>

      {data.payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Payments appear here as soon as customers pay for completed jobs."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Technician</th>
                <th className="px-5 py-3 font-medium">Paid at</th>
                <th className="px-5 py-3 font-medium">Transaction</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="max-w-[200px] truncate px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                    {p.serviceTitle || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    <span className="block truncate">{p.customerName}</span>
                    <span className="block truncate text-xs">{p.customerEmail}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {p.technicianName || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {formatDateTime(p.paidAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <PaymentBadge status={p.paymentStatus} />
                      <span className="font-mono text-xs text-slate-400">
                        {(p.transactionId || p.stripeSessionId || "").slice(0, 14)}…
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-100">
                    {formatMoney(p.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        downloadInvoice(p);
                        toast.success("Invoice downloaded");
                      }}
                    >
                      <Download className="mr-1.5 h-4 w-4" /> PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
