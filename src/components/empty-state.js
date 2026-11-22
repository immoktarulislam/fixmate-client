import Link from "next/link";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Friendly empty state with optional call-to-action. */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center",
        className
      )}
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {(actionLabel && actionHref) && (
        <Link href={actionHref} className={cn(buttonVariants({ className: "mt-5" }))}>
          {actionLabel}
        </Link>
      )}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className={cn(buttonVariants({ variant: "outline", className: "mt-5" }))}
        >
          {actionLabel || "Continue"}
        </button>
      )}
    </div>
  );
}
