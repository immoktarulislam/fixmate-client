"use client";

import { cn } from "@/lib/utils";

/** Page header used consistently across every dashboard screen. */
export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Loading skeleton that mirrors the dashboard content shape. */
export function DashboardSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-52 rounded-md bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-6 rounded bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export function ErrorNote({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Panel({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {children}
    </div>
  );
}
