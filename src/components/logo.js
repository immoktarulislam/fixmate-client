import { cn } from "@/lib/utils";

/** FixMate mark: a wrench crossing a lightning bolt inside a rounded tile. */
export function LogoMark({ className }) {
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-sm ring-1 ring-inset ring-white/20",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M14.7 6.3a4.5 4.5 0 0 0-6 5.7L4 16.7V20h3.3l4.7-4.7a4.5 4.5 0 0 0 5.7-6l-2.9 2.9-2.4-.6-.6-2.4 2.9-2.9z" />
        <path d="M13 3.5 10.5 8H14l-1 3.5L15.5 9H12l1-5.5z" fill="white" stroke="none" />
      </svg>
    </span>
  );
}

/** Wordmark: Fix + Mate with a teal/amber split. */
export function Logo({ className, href = "/" }) {
  return (
    <a href={href} className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-bold tracking-tight">
        Fix<span className="text-primary">Mate</span>
      </span>
    </a>
  );
}
