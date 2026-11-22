import Link from "next/link";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

/**
 * Public service card used on home + /services grids.
 * `service` comes straight from GET /api/services.
 */
export default function ServiceCard({ service, className }) {
  const rating = Number(service.rating) || 0;
  const count = Number(service.ratingCount) || 0;

  return (
    <Link
      href={`/services/${service._id}`}
      className={cn(
        "card-hover group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={service.image || "/services/default.svg"}
          alt={service.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {service.category}
        </span>
        {!service.isAvailable && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
            Unavailable
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold leading-snug group-hover:text-primary">
            {service.title}
          </h3>
          {rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
              {count > 0 && <span className="text-muted-foreground/70">({count})</span>}
            </span>
          )}
        </div>

        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {service.description}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">
            {service.technicianName}
          </span>
          <span className="font-semibold text-primary">
            From ${Number(service.basePrice).toFixed(0)}
          </span>
        </div>
      </div>
    </Link>
  );
}
