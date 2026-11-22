"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { CATEGORIES, SORT_OPTIONS, SERVICE_MODES } from "@/lib/constants";
import ServiceCard from "@/components/service-card";
import Pagination from "@/components/pagination";
import EmptyState from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react";

/**
 * Challenge 1: search / filter / sort / pagination are executed inside
 * MongoDB by GET /api/services - this component only writes the state into
 * the URL (so it survives reloads) and asks the API for the matching page.
 */
export default function ServicesBrowser() {
  const router = useRouter();
  const params = useSearchParams();

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const mode = params.get("mode") || "";
  const sort = params.get("sort") || "newest";
  const page = Math.max(1, parseInt(params.get("page"), 10) || 1);

  const [draftSearch, setDraftSearch] = useState(search);
  const [state, setState] = useState({ loading: true, services: [], total: 0, totalPages: 1, error: null });

  // Keep the input in sync when the URL changes (back/forward, category cards).
  useEffect(() => setDraftSearch(search), [search]);

  const apply = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === "" || value === null || value === undefined) next.delete(key);
        else next.set(key, String(value));
      }
      if (resetPage && !("page" in patch)) next.delete("page");
      const qs = next.toString();
      router.push(qs ? `/services?${qs}` : "/services", { scroll: false });
    },
    [params, router]
  );

  useEffect(() => {
    let alive = true;
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (category) query.set("category", category);
    if (mode) query.set("mode", mode);
    query.set("sort", sort);
    query.set("page", String(page));
    query.set("limit", "9");

    setState((s) => ({ ...s, loading: true, error: null }));
    api(`/services?${query.toString()}`, { auth: false })
      .then((data) => {
        if (!alive) return;
        setState({
          loading: false,
          services: data.services || [],
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          error: null,
        });
      })
      .catch((err) => {
        if (!alive) return;
        setState((s) => ({ ...s, loading: false, error: err.message }));
      });

    return () => {
      alive = false;
    };
  }, [search, category, mode, sort, page]);

  function submitSearch(e) {
    e.preventDefault();
    apply({ search: draftSearch.trim() });
  }

  const hasFilters = Boolean(search || category || mode);

  return (
    <div className="space-y-6">
      {/* --------------------------- Filter bar --------------------------- */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <form onSubmit={submitSearch} className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder="Search title, area, technician…"
              className="pl-9"
              aria-label="Search services"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:shrink-0">
            <Select
              value={category}
              onChange={(e) => apply({ category: e.target.value })}
              aria-label="Filter by category"
              className="lg:w-44"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              value={mode}
              onChange={(e) => apply({ mode: e.target.value })}
              aria-label="Filter by service mode"
              className="lg:w-40"
            >
              <option value="">Any mode</option>
              {SERVICE_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(e) => apply({ sort: e.target.value, page: 1 }, { resetPage: false })}
              aria-label="Sort services"
              className="col-span-2 sm:col-span-1 lg:w-48"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" className="lg:px-5">
            <Search className="lg:hidden" /> Search
          </Button>
        </form>

        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <SlidersHorizontal className="size-3.5" /> Active:
            </span>
            {search && (
              <FilterChip label={`“${search}”`} onClear={() => apply({ search: "" })} />
            )}
            {category && (
              <FilterChip label={category} onClear={() => apply({ category: "" })} />
            )}
            {mode && <FilterChip label={mode} onClear={() => apply({ mode: "" })} />}
            <button
              type="button"
              onClick={() => router.push("/services")}
              className="ml-auto text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ---------------------------- Results ---------------------------- */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {state.loading
            ? "Searching…"
            : `${state.total} service${state.total === 1 ? "" : "s"} found`}
        </p>
      </div>

      {state.error && (
        <EmptyState
          icon={SearchX}
          title="Could not load services"
          description={`${state.error} Is the FixMate API running on port 5000?`}
        />
      )}

      {!state.error && state.loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!state.error && !state.loading && state.services.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No services match your filters"
          description="Try a different keyword, or clear the filters to see everything."
          actionLabel="Clear filters"
          onAction={() => router.push("/services")}
        />
      )}

      {!state.error && !state.loading && state.services.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {state.services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={state.totalPages}
            hrefFor={(p) => {
              const next = new URLSearchParams(params.toString());
              next.set("page", String(p));
              return `/services?${next.toString()}`;
            }}
          />
        </>
      )}
    </div>
  );
}

function FilterChip({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove filter ${label}`}
        className="rounded-full p-0.5 hover:bg-primary/20"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
