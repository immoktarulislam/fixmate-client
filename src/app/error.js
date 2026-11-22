"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Root error boundary (custom error page). */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-red-500/12 text-red-600 dark:text-red-400">
        <AlertTriangle className="size-8" />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
        Something went sideways
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        An unexpected error occurred
        {error?.message ? `: ${error.message}` : "."} You can retry, or head
        back home.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()}>
          <RotateCcw /> Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
