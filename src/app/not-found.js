import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Custom 404 page. */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="relative">
        <span className="block text-[7rem] font-extrabold leading-none tracking-tighter text-primary/15 sm:text-[9rem]">
          404
        </span>
        <SearchX className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-primary" />
      </div>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        This page went missing
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        The link may be broken, or the page was moved. Let&apos;s get you back
        to a working repair.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants()}>
          Back to home
        </Link>
        <Link href="/services" className={buttonVariants({ variant: "outline" })}>
          Browse services
        </Link>
      </div>
    </div>
  );
}
