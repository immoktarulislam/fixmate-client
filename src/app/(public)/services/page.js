import { Suspense } from "react";
import PageHeader from "@/components/page-header";
import ServicesBrowser from "@/components/services/services-browser";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Services",
  description:
    "Search, filter and sort verified repair services - smartphones, laptops, ACs, refrigerators, TVs, washing machines and electrical work.",
};

/** /services - Challenge 1: filters live in the URL and persist on reload. */
export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Repair services"
        description="Search by keyword, filter by category or mode, and sort by price. Everything runs on the server - just like the assignment asks."
      />
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <ServicesBrowser />
      </Suspense>
    </div>
  );
}
