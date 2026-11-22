import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

const STATUS_DOT = {
  requested: "bg-blue-500",
  accepted: "bg-indigo-500",
  "in-progress": "bg-amber-500",
  completed: "bg-emerald-500",
  rejected: "bg-red-500",
  cancelled: "bg-zinc-500",
  paid: "bg-emerald-500",
};

/**
 * Optional requirement #3: statusHistory timeline shown on booking details.
 * `history` = [{ status, changedAt, changedBy }]
 */
export default function StatusTimeline({ history = [], className }) {
  if (!history.length) return null;

  return (
    <ol className={cn("relative ml-1 space-y-5 border-l border-border pl-5", className)}>
      {history.map((entry, i) => {
        const key = `${entry.status}-${entry.changedAt}-${i}`;
        const label =
          entry.status === "paid"
            ? "Payment received"
            : STATUS_LABELS[entry.status] || entry.status;
        return (
          <li key={key} className="relative">
            <span
              className={cn(
                "absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-card",
                STATUS_DOT[entry.status] || "bg-muted-foreground"
              )}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-medium capitalize">{label}</span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(entry.changedAt)}
              </span>
            </div>
            {entry.changedBy && (
              <p className="text-xs capitalize text-muted-foreground">
                by {entry.changedBy}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
