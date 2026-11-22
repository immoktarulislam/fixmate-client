import Link from "next/link";
import {
  CalendarCheck,
  CreditCard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CATEGORY_META } from "@/lib/constants";
import FeaturedServices from "@/components/home/featured-services";

const STEPS = [
  {
    step: "01",
    title: "Book a technician",
    text: "Pick a service, describe the problem and choose a date that works for you.",
    icon: CalendarCheck,
  },
  {
    step: "02",
    title: "Track the repair",
    text: "Follow every status change live - requested, accepted, in progress, completed.",
    icon: MapPin,
  },
  {
    step: "03",
    title: "Pay after service",
    text: "The job is only invoiced once it's done. Pay securely with Stripe.",
    icon: CreditCard,
  },
];

const PERKS = [
  {
    icon: ShieldCheck,
    title: "Verified technicians",
    text: "Every pro is reviewed by our team before a single service goes live.",
  },
  {
    icon: Star,
    title: "Real reviews",
    text: "Ratings only come from customers who actually paid for the job.",
  },
  {
    icon: FileText,
    title: "PDF invoices",
    text: "Download a clean invoice for every completed, paid repair.",
  },
  {
    icon: Sparkles,
    title: "40+ repair types",
    text: "Phones, laptops, ACs, fridges, TVs, washers and electrical faults.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden border-b border-border bg-grid-fade">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:pb-24 lg:pt-20">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              Pay only after the repair is done
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Your gadgets,
              <br />
              <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-amber-400 bg-clip-text text-transparent">
                back to life.
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              FixMate connects you with verified technicians for smart devices
              and home appliances. Book in minutes, track the job in real time
              and pay only when the work is finished.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/services">
                  Browse services <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-up">Become a technician</Link>
              </Button>
            </div>
            <dl className="grid max-w-md grid-cols-3 gap-4 pt-3">
              {[
                ["12+", "Live services"],
                ["7", "Categories"],
                ["24h", "Avg. response"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-bold text-primary">{value}</dt>
                  <dd className="text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual: stacked repair "tickets" */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="absolute -right-6 -top-6 size-72 rounded-full bg-teal-500/15 blur-3xl" />
            <div className="absolute -bottom-10 -left-8 size-60 rounded-full bg-amber-400/15 blur-3xl" />
            <div className="relative mx-auto max-w-md space-y-4">
              <div className="rotate-[-2deg] rounded-2xl border border-border bg-card p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/12 px-2.5 py-1 text-xs font-semibold text-blue-600 ring-1 ring-inset ring-blue-500/30">
                    Requested
                  </span>
                  <span className="text-xs text-muted-foreground">Today, 9:41</span>
                </div>
                <p className="mt-3 font-semibold">iPhone 13 screen replacement</p>
                <p className="text-sm text-muted-foreground">with Rahul · Dhanmondi</p>
              </div>
              <div className="rotate-[1.5deg] translate-x-6 rounded-2xl border border-border bg-card p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/30">
                    In Progress
                  </span>
                  <span className="text-xs text-muted-foreground">Today, 11:02</span>
                </div>
                <p className="mt-3 font-semibold">AC gas refill & service</p>
                <p className="text-sm text-muted-foreground">with Nabila · Uttara</p>
              </div>
              <div className="rotate-[-1deg] translate-x-2 rounded-2xl border border-emerald-500/40 bg-card p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/30">
                    Completed · Paid
                  </span>
                  <span className="text-xs text-muted-foreground">$45.00</span>
                </div>
                <p className="mt-3 font-semibold">MacBook fan cleaning</p>
                <p className="text-sm text-muted-foreground">with Imran · Gulshan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- Categories --------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What needs fixing?
            </h2>
            <p className="mt-1.5 text-muted-foreground">
              Jump straight into a pre-filtered list of services.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <Link
                key={cat}
                href={`/services?category=${encodeURIComponent(cat)}`}
                className="card-hover group rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <span className="text-2xl">{meta.emoji}</span>
                <h3 className="mt-2.5 text-sm font-semibold group-hover:text-primary sm:text-base">
                  {cat}
                </h3>
                <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                  {meta.blurb}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --------------------------- Featured ---------------------------- */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Fresh on the marketplace
            </h2>
            <p className="mt-1.5 text-muted-foreground">
              Recently approved services from our technicians.
            </p>
          </div>
          <FeaturedServices />
        </div>
      </section>

      {/* --------------------------- How it works ------------------------ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Repair in three simple steps
        </h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ step, title, text, icon: Icon }) => (
            <div
              key={step}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="absolute right-4 top-3 text-5xl font-extrabold text-muted/70">
                {step}
              </span>
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------- Perks ----------------------------- */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-teal-500/12 text-teal-600 dark:text-teal-400">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ CTA ------------------------------ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 px-6 py-12 text-center shadow-xl sm:px-12">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 size-56 rounded-full bg-amber-300/20" />
          <div className="relative space-y-4">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Broken something? Fix it today.
            </h2>
            <p className="mx-auto max-w-xl text-sm text-teal-50/90 sm:text-base">
              Create a free account, describe your problem and get matched with
              a verified technician - no payment until the job is done.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/sign-up">Create free account</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/services">See all services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
