import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-primary/12 text-primary ring-primary/30",
        secondary: "bg-secondary text-secondary-foreground ring-border",
        outline: "text-foreground ring-border",
        success:
          "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30",
        warning:
          "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-amber-500/30",
        destructive:
          "bg-red-500/12 text-red-600 dark:text-red-400 ring-red-500/30",
        info: "bg-blue-500/12 text-blue-600 dark:text-blue-400 ring-blue-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
