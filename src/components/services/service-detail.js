"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { validateBookingForm } from "@/lib/validation";
import { todayISO, formatMoney, formatDate } from "@/lib/utils";
import { STATUS_BADGE, PAYMENT_BADGE, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Star,
  Wrench,
  Wallet,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { initials } from "@/lib/utils";
import { toast } from "sonner";

const EMPTY = {
  phone: "",
  address: "",
  preferredDate: todayISO(),
  problemDescription: "",
};

/** Service details + "Book this service" dialog (customer flow). */
export default function ServiceDetail({ id }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [state, setState] = useState({ loading: true, service: null, technician: null, error: null });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    api(`/services/${id}`, { auth: false })
      .then((data) => alive && setState({ loading: false, ...data, error: null }))
      .catch((err) => alive && setState({ loading: false, service: null, technician: null, error: err.message }));
    return () => {
      alive = false;
    };
  }, [id]);

  if (state.loading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (state.error || !state.service) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={Wrench}
          title="Service not found"
          description={`${state.error || "This service may have been removed or is not available."}`}
          actionLabel="Back to services"
          actionHref="/services"
        />
        <div className="mt-4 text-center">
          <Button variant="ghost" asChild>
            <Link href="/services">
              <ArrowLeft /> All services
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const service = state.service;
  const technician = state.technician || {};
  const user = session?.user;
  const isCustomer = user && (user.role || "customer") === "customer";
  const isOwn = user && user.email === service.technicianEmail;
  const rating = Number(service.rating) || 0;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function submitBooking(e) {
    e.preventDefault();
    const errs = validateBookingForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await api("/bookings", {
        method: "POST",
        body: { serviceId: id, ...form, problemDescription: form.problemDescription.trim() },
      });
      toast.success("Request sent! The technician will review it shortly.");
      setOpen(false);
      setForm(EMPTY);
      router.push("/dashboard/customer/bookings");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Please sign in to book this service");
        router.push(`/sign-in?callback=${encodeURIComponent(`/services/${id}`)}`);
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-5">
        <Link href="/services">
          <ArrowLeft /> Back to services
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* ------------------------------ Main ------------------------------ */}
        <article className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="relative aspect-[16/9] bg-muted">
              <img
                src={service.image || "/services/default.svg"}
                alt={service.title}
                className="size-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {service.category}
              </span>
              <span
                className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm ${
                  service.isAvailable ? "bg-emerald-600/90" : "bg-red-600/90"
                }`}
              >
                {service.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {service.title}
                  </h1>
                  {rating > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/30">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {rating.toFixed(1)}
                      {service.ratingCount > 0 && ` · ${service.ratingCount} reviews`}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Offered by {service.technicianName}
                  {service.serviceArea ? ` · ${service.serviceArea}` : ""}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <InfoTile icon={Wallet} label="Base price" value={formatMoney(service.basePrice)} />
                <InfoTile icon={Clock} label="Duration" value={service.estimatedDuration || "Varies"} />
                <InfoTile icon={MapPin} label="Mode" value={service.serviceMode} />
                <InfoTile
                  icon={CalendarDays}
                  label="Listed"
                  value={formatDate(service.createdAt)}
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  About this service
                </h2>
                <p className="mt-2 leading-relaxed text-foreground/90">
                  {service.description}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    Payment happens <strong className="text-foreground">after</strong> the
                    job is completed. You&apos;ll review the final amount first and can pay
                    securely with Stripe - nothing is charged up front.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* ----------------------------- Aside ----------------------------- */}
        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Starting at</span>
              <span className="text-3xl font-extrabold text-primary">
                {formatMoney(service.basePrice)}
              </span>
            </div>

            <div className="mt-4">
              {isOwn ? (
                <div className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
                  This is your own service - manage it from{" "}
                  <Link href="/dashboard/technician/services" className="font-semibold text-primary hover:underline">
                    your dashboard
                  </Link>
                  .
                </div>
              ) : isCustomer || !user ? (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Book this service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Book “{service.title}”</DialogTitle>
                      <DialogDescription>
                        Tell the technician what&apos;s wrong and when you&apos;d like the
                        visit. No payment now.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitBooking} className="space-y-4">
                      <Field label="Phone number" error={errors.phone}>
                        <Input
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="+880 1XXX-XXXXXX"
                          autoComplete="tel"
                        />
                      </Field>

                      <Field label="Service address" error={errors.address}>
                        <Input
                          value={form.address}
                          onChange={(e) => set("address", e.target.value)}
                          placeholder="House, road, area, city"
                          autoComplete="street-address"
                        />
                      </Field>

                      <Field label="Preferred date" error={errors.preferredDate}>
                        <Input
                          type="date"
                          min={todayISO()}
                          value={form.preferredDate}
                          onChange={(e) => set("preferredDate", e.target.value)}
                        />
                      </Field>

                      <Field
                        label="Problem description"
                        error={errors.problemDescription}
                        hint={`${form.problemDescription.trim().length}/20 characters minimum`}
                      >
                        <Textarea
                          value={form.problemDescription}
                          onChange={(e) => set("problemDescription", e.target.value)}
                          placeholder="e.g. Screen cracked after a fall, touch still works but display has lines…"
                          rows={4}
                          maxLength={800}
                        />
                      </Field>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpen(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? "Sending…" : "Send request"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  variant="secondary"
                  asChild
                >
                  <Link
                    href={`/sign-in?callback=${encodeURIComponent(`/services/${id}`)}`}
                  >
                    Sign in as a customer to book
                  </Link>
                </Button>
              )}
            </div>

            <ul className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <BadgeCheck className="size-3.5 text-emerald-600" /> Identity-verified technician
              </li>
              <li className="flex items-center gap-2">
                <Wallet className="size-3.5 text-emerald-600" /> Pay after the repair
              </li>
              <li className="flex items-center gap-2">
                <Star className="size-3.5 text-emerald-600" /> Reviews from paid jobs only
              </li>
            </ul>
          </div>

          {/* Technician card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your technician
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="size-12">
                {technician.image && <AvatarImage src={technician.image} alt={technician.name} />}
                <AvatarFallback className="text-sm">{initials(technician.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{technician.name || service.technicianName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {technician.area || service.serviceArea || "FixMate technician"}
                </p>
              </div>
            </div>
            {technician.bio && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {technician.bio}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </span>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
