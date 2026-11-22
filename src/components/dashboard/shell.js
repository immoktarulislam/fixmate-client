"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Wrench,
  Inbox,
  Users,
  ShieldCheck,
  Receipt,
  UserRound,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "@/lib/auth-client";

const NAV = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/bookings", label: "My Bookings", icon: CalendarCheck },
    { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  technician: [
    { href: "/dashboard/technician", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/technician/add-service", label: "Add Service", icon: Wrench },
    { href: "/dashboard/technician/services", label: "My Services", icon: Wrench },
    { href: "/dashboard/technician/requests", label: "Job Requests", icon: Inbox },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/services", label: "Services", icon: ShieldCheck },
    { href: "/dashboard/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: Receipt },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
};

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);

  const role = session?.user?.role || "customer";
  const links = NAV[role] || NAV.customer;
  const user = session?.user;

  const nav = (
    <nav className="flex-1 space-y-1 px-3">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo href="/dashboard" />
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="rounded-md p-1 text-slate-500 hover:text-slate-800 lg:hidden dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {nav}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-teal-600 text-xs font-semibold text-white">
              {initials(user?.name) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {user?.name || "…"}
            </p>
            <p className="truncate text-xs capitalize text-slate-500 dark:text-slate-400">{role}</p>
          </div>
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => (window.location.href = "/") } })}
            aria-label="Sign out"
            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        {sidebarInner}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {sidebarInner}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden text-sm text-slate-500 sm:block dark:text-slate-400">
              FixMate <span className="mx-1 text-slate-300 dark:text-slate-600">/</span>
              <span className="font-medium capitalize text-slate-700 dark:text-slate-200">{role} dashboard</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none ring-teal-600 focus-visible:ring-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-teal-600 text-xs font-semibold text-white">
                    {initials(user?.name) || "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-semibold">{user?.name || "…"}</p>
                  <p className="truncate text-xs font-normal text-slate-500">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <UserRound className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Wrench className="mr-2 h-4 w-4" /> Book a service
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() =>
                    signOut({ fetchOptions: { onSuccess: () => (window.location.href = "/") } })
                  }
                  className="text-red-600 focus:text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {isPending ? (
            <div className="flex items-center justify-center py-24">
              <Spinner className="h-8 w-8 text-teal-600" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
