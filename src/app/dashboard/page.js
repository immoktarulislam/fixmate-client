"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

const HOME = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
};

/** `/dashboard` always lands on the signed-in user's own overview. */
export default function DashboardIndexPage() {
  const router = useRouter();
  const { data, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    const role = data?.user?.role || "customer";
    router.replace(HOME[role] || HOME.customer);
  }, [isPending, data, router]);

  return (
    <div className="flex items-center justify-center py-32">
      <Spinner className="h-8 w-8 text-teal-600" />
    </div>
  );
}
