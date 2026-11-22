import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/80 dark:bg-muted/40",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
