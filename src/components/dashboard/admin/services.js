"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Search, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { ApprovalBadge } from "@/components/badges";
import EmptyState from "@/components/empty-state";
import ConfirmDialog from "@/components/confirm-dialog";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FILTERS = ["", "pending", "approved", "rejected"];

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { service, approvalStatus }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter) params.set("approvalStatus", filter);
      if (query) params.set("search", query);
      const data = await api(`/admin/services?${params.toString()}`);
      setServices(data.services || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function setApproval() {
    if (!confirm) return;
    const { service, approvalStatus } = confirm;
    setBusyId(service._id);
    try {
      const data = await api(`/admin/services/${service._id}/approval`, {
        method: "PATCH",
        body: { approvalStatus },
      });
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? data.service : s))
      );
      toast.success(`Service ${approvalStatus}`);
      setConfirm(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const counts = (status) =>
    status === ""
      ? services.length
      : services.filter((s) => s.approvalStatus === status).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service moderation"
        description="Approve what goes live on the marketplace. Pending items are listed first."
      />

      <ErrorNote message={error} onRetry={load} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f || "all"}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                filter === f
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
              }`}
            >
              {f || "all"}
              <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/15">
                {counts(f)}
              </span>
            </button>
          ))}
        </div>

        <form
          className="relative sm:ml-auto sm:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, technician…"
            className="pl-9"
          />
        </form>
      </div>

      {loading ? (
        <DashboardSkeleton rows={5} />
      ) : services.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No services match"
          description="Adjust the filter or search term."
        />
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <Panel key={s._id} className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image || "/services/default.svg"}
                  alt={s.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{s.title}</h3>
                  <ApprovalBadge status={s.approvalStatus} />
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                  {s.technicianName} · {s.technicianEmail}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">{s.category}</Badge>
                  <Badge variant="outline" className="text-xs">{s.serviceMode}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatMoney(s.basePrice)}
                  </Badge>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                {s.approvalStatus !== "approved" && (
                  <Button
                    size="sm"
                    onClick={() => setConfirm({ service: s, approvalStatus: "approved" })}
                    disabled={busyId === s._id}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                  </Button>
                )}
                {s.approvalStatus !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setConfirm({ service: s, approvalStatus: "rejected" })}
                    disabled={busyId === s._id}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" /> Reject
                  </Button>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        destructive={confirm?.approvalStatus === "rejected"}
        title={confirm?.approvalStatus === "approved" ? "Approve this service?" : "Reject this service?"}
        description={
          confirm
            ? `“${confirm.service.title}” by ${confirm.service.technicianName} will be marked as ${confirm.approvalStatus}.`
            : ""
        }
        confirmLabel={confirm?.approvalStatus === "approved" ? "Approve" : "Reject"}
        onConfirm={setApproval}
      />
    </div>
  );
}
