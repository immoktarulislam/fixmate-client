"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

function homeFor(role) {
  if (role === "technician") return "/dashboard/technician";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/customer";
}

/**
 * Client-side gate for the dashboard tree:
 *  - no session      -> /sign-in
 *  - wrong role area -> that role's own dashboard (403 semantics live on the
 *                       API; this is just friendly UX)
 * `roles` = array of allowed roles (omit to allow any signed-in user).
 *
 * The shared session cache can still hold the pre-sign-in value for a beat, so
 * when no user is found we ask the server once before redirecting - otherwise
 * a fresh sign-in could bounce straight back to the sign-in page.
 */
export default function AuthGuard({ roles, children }) {
  const { data, isPending, refetch } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const user = data?.user;
  // Pathname whose session has already been re-checked with the server.
  const [rechecked, setRechecked] = useState(null);

  useEffect(() => {
    if (isPending) return;

    // Wrong role for this area -> that role's own dashboard.
    if (user && roles && !roles.includes(user.role || "customer")) {
      router.replace(homeFor(user.role));
      return;
    }
    if (user) return;

    if (rechecked === pathname) {
      clearToken();
      router.replace(`/sign-in?callback=${encodeURIComponent(pathname)}`);
      return;
    }

    let alive = true;
    (async () => {
      await refetch();
      if (alive) setRechecked(pathname);
    })();
    return () => {
      alive = false;
    };
  }, [isPending, user, roles, router, pathname, rechecked, refetch]);

  if (isPending || !user || (roles && !roles.includes(user.role || "customer"))) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return children;
}
