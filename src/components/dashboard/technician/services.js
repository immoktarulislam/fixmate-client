"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Wrench,
  Plus,
  EyeOff,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { ApprovalBadge } from "@/components/badges";
import EmptyState from "@/components/empty-state";
import ConfirmDialog from "@/components/confirm-dialog";
import { PageHeader, Panel, ErrorNote, DashboardSkeleton } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceForm from "@/components/dashboard/technician/service-form";

export default function TechnicianServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/services/mine");
      setServices(data.services || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleAvailability(service) {
    setBusyId(service._id);
    try {
      const data = await api(`/services/${service._id}/availability`, { method: "PATCH" });
      setServices((prev) => prev.map((s) => (s._id === service._id ? data.service : s)));
      toast.success(data.service.isAvailable ? "Service is live" : "Service paused");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit(payload) {
    setSaving(true);
    try {
      const data = await api(`/services/${editing._id}`, { method: "PATCH", body: payload });
      setServices((prev) => prev.map((s) => (s._id === editing._id ? data.service : s)));
      toast.success("Service updated — sent back for admin approval");
      setEditing(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeService(service) {
    setBusyId(service._id);
    try {
      await api(`/services/${service._id}`, { method: "DELETE" });
      setServices((prev) => prev.filter((s) => s._id !== service._id));
      toast.success("Service deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <DashboardSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My services"
        description="Edit, pause or remove the services you offer. Content edits need re-approval."
        actions={
          <Button asChild>
            <Link href="/dashboard/technician/add-service">
              <Plus className="mr-2 h-4 w-4" /> Add service
            </Link>
          </Button>
        }
      />

      <ErrorNote message={error} onRetry={load} />

      {services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="You have not published anything yet"
          description="Create your first service so customers can book you."
          actionLabel="Add a service"
          actionHref="/dashboard/technician/add-service"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <Panel key={s._id} className="flex flex-col gap-3 overflow-hidden p-0">
              <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image || "/services/default.svg"}
                  alt={s.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-2 top-2 flex gap-1.5">
                  <ApprovalBadge status={s.approvalStatus} />
                </div>
                {!s.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55">
                    <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700">
                      <EyeOff className="h-3.5 w-3.5" /> Paused
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug text-slate-800 dark:text-slate-100">
                      {s.title}
                    </h3>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs">{s.category}</Badge>
                    <Badge variant="outline" className="text-xs">{s.serviceMode}</Badge>
                    {s.rating > 0 && (
                      <Badge variant="outline" className="text-xs">★ {s.rating}</Badge>
                    )}
                  </div>
                </div>

                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {formatMoney(s.basePrice)}
                  <span className="text-xs font-normal text-slate-400"> base</span>
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Switch
                      checked={s.isAvailable}
                      disabled={busyId === s._id}
                      onCheckedChange={() => toggleAvailability(s)}
                    />
                    {s.isAvailable ? (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> Visible
                      </span>
                    ) : (
                      "Hidden"
                    )}
                  </label>

                  <div className="flex gap-1">
                    {s.approvalStatus === "approved" && s.isAvailable && (
                      <Button asChild size="sm" variant="ghost" title="View public page">
                        <Link href={`/services/${s._id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(s)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDialog
                      destructive
                      title="Delete this service?"
                      description={`“${s.title}” will be permanently removed along with its bookings link.`}
                      confirmLabel="Delete"
                      onConfirm={() => removeService(s)}
                      trigger={
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === s._id}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Edit service</DialogTitle>
              </DialogHeader>
              <ServiceForm
                initial={editing}
                onSubmit={saveEdit}
                submitting={saving}
                onCancel={() => setEditing(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
