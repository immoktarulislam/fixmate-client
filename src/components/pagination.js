"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pagination controls that keep every existing query param (search/category/
 * sort persist across page changes - Challenge 1).
 *
 *   const params = new URLSearchParams(searchParams)
 *   <Pagination page={page} totalPages={totalPages} hrefFor={(p) => `/services?${...}`} />
 */
export default function Pagination({ page, totalPages, hrefFor, className }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const window = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= window) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const btn =
    "flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-2.5 text-sm font-medium transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-8 flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(btn, "hover:bg-muted")} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(btn, "cursor-not-allowed opacity-40")} aria-hidden="true">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className={cn(btn, "border-transparent text-muted-foreground")}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              btn,
              p === page
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted"
            )}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={cn(btn, "hover:bg-muted")} aria-label="Next page">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(btn, "cursor-not-allowed opacity-40")} aria-hidden="true">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
