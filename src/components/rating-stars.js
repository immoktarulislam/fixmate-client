"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";

/**
 * Optional requirement #2: rate & review a booking - only rendered when the
 * booking is `completed` + `paid` and not yet rated.
 */
export default function RatingStars({ booking, onRated }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (rating < 1) {
      toast.error("Pick a star rating first");
      return;
    }
    setSaving(true);
    try {
      const res = await api(`/bookings/${booking._id}/rating`, {
        method: "PATCH",
        body: { rating, review },
      });
      toast.success("Thanks for your review!");
      setReview("");
      onRated?.(res.booking);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-sm font-medium">How did we do?</p>
      <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "size-6",
                (hover || rating) >= n
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/50"
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Share a few words about the repair (optional)"
        className="mt-3 min-h-[70px]"
        maxLength={500}
      />
      <Button size="sm" className="mt-3" onClick={submit} disabled={saving}>
        {saving ? "Submitting..." : "Submit review"}
      </Button>
    </div>
  );
}
