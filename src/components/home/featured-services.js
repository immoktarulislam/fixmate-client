"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import ServiceCard from "@/components/service-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/empty-state";
import { Wrench } from "lucide-react";

/** Latest approved services, fetched in the browser (no build-time API call). */
export default function FeaturedServices() {
  const [state, setState] = useState({ loading: true, services: [], error: null });

  useEffect(() => {
    let alive = true;
    api("/services?limit=6&sort=newest", { auth: false })
      .then((data) => alive && setState({ loading: false, services: data.services || [], error: null }))
      .catch((err) => alive && setState({ loading: false, services: [], error: err.message }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (state.error) {
    return (
      <EmptyState
        icon={Wrench}
        title="Services are out of reach right now"
        description={`${state.error} Make sure the FixMate API is running on port 5000.`}
      />
    );
  }

  if (!state.services.length) {
    return (
      <EmptyState
        icon={Wrench}
        title="No services published yet"
        description="Technicians are still setting up their shops."
        actionLabel="Check again"
        actionHref="/services"
      />
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {state.services.map((service) => (
          <ServiceCard key={service._id} service={service} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button variant="outline" size="lg" asChild>
          <Link href="/services">Browse all services →</Link>
        </Button>
      </div>
    </>
  );
}
