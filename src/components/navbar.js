"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import { NAV_LINKS, ROLE_LABELS } from "@/lib/constants";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials, cn } from "@/lib/utils";
import { LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { toast } from "sonner";

function dashboardHref(role) {
  if (role === "technician") return "/dashboard/technician";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/customer";
}

/** Public site navbar: logo, links, theme toggle, auth state. */
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending } = useSession();
  const [open, setOpen] = useState(false);

  const user = data?.user;
  const role = user?.role || "customer";

  async function handleSignOut() {
    try {
      await signOut();
      clearToken();
      toast.success("Signed out");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Could not sign out");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {!isPending && !user && (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get started</Link>
              </Button>
            </div>
          )}

          {user && (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full pl-1 pr-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Account menu"
                  >
                    <Avatar className="size-8">
                      {user.image && <AvatarImage src={user.image} alt={user.name} />}
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[110px] truncate text-sm font-medium lg:block">
                      {user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="normal-case">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                    <span className="mt-1.5 inline-block">
                      <RoleBadge role={role} />
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref(role)}>
                      <LayoutDashboard /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <User /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSignOut();
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          className="border-t border-border bg-background px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === link.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/70"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <Button asChild variant="outline">
                    <Link href={dashboardHref(role)} onClick={() => setOpen(false)}>
                      <LayoutDashboard /> Dashboard ({ROLE_LABELS[role]})
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut /> Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/sign-in" onClick={() => setOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up" onClick={() => setOpen(false)}>
                      Get started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
