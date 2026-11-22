"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import AuthGuard from "@/components/auth-guard";
import ServiceForm from "@/components/dashboard/technician/service-form";
import { PageHeader, Panel } from "@/components/dashboard/parts";

function AddServiceInner() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(payload) {
    setSubmitting(true);
    try {
      await api("/services", { method: "POST", body: payload });
      toast.success("Service submitted for admin approval");
      router.push("/dashboard/technician/services");
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add a service"
        description="New services enter an admin moderation queue and go live once approved."
      />
      <Panel>
        <ServiceForm onSubmit={handleCreate} submitting={submitting} />
      </Panel>
    </div>
  );
}

export default function AddServicePage() {
  return (
    <AuthGuard roles={["technician"]}>
      <AddServiceInner />
    </AuthGuard>
  );
}
