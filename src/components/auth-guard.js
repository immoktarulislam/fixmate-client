"use client";

import { useEffect } from "react";
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
 */
export default function AuthGuard({ roles, children }) {
  const { data, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const user = data?.user;

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      clearToken();
      router.replace(`/sign-in?callback=${encodeURIComponent(pathname)}`);
      return;
    }
    if (roles && !roles.includes(user.role || "customer")) {
      router.replace(homeFor(user.role));
    }
  }, [isPending, user, roles, router, pathname]);

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
