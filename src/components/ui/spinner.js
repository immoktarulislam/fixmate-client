import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Spinning loader used inside buttons and inline states. */
function Spinner({ className, ...props }) {
  return (
    <Loader2 className={cn("size-4 animate-spin", className)} {...props} />
  );
}

export { Spinner };
