import { cn } from "@/lib/utils";

/** Dashboard KPI card: icon tile, label, value, optional delta line. */
export default function StatsCard({ icon: Icon, label, value, hint, tone = "teal", className }) {
  const tones = {
    teal: "bg-teal-500/12 text-teal-600 dark:text-teal-400",
    amber: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    green: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    purple: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
    red: "bg-red-500/12 text-red-600 dark:text-red-400",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              tones[tone] || tones.teal
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
      </div>
    </div>
  );
}
