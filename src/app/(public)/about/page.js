import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Users,
  Receipt,
  MapPin,
  Clock,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust first",
    text: "Technicians are profiled, reviewed by our moderation team, and every service is approved before it goes public.",
  },
  {
    icon: Zap,
    title: "Fast matching",
    text: "Describe the problem once - qualified technicians respond with accept/reject within hours, not days.",
  },
  {
    icon: Receipt,
    title: "Pay after service",
    text: "No prepayments. The final amount is set by the technician when the job is done, and you pay with Stripe.",
  },
  {
    icon: Users,
    title: "Real community",
    text: "Ratings and reviews are only unlocked after a paid job, so every star is earned.",
  },
];

const FACTS = [
  { icon: MapPin, label: "Coverage", value: "All major city areas" },
  { icon: Clock, label: "Response", value: "Within 24 hours" },
  { icon: HeartHandshake, label: "Model", value: "Pay after service" },
];

export const metadata = {
  title: "About",
  description:
    "FixMate is a smart device & home appliance repair marketplace - verified technicians, live job tracking and Stripe pay-after-service.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="About FixMate"
        description="We're building the calmest way to get anything in your home fixed."
      />

      {/* Story */}
      <section className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-bold sm:text-2xl">
            Repair should be simple, transparent and fair
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            FixMate started with a frustrating truth: getting a phone screen or an
            AC fixed usually means calling around, guessing at prices and hoping
            the person who shows up knows what they&apos;re doing. We built a
            marketplace that removes that guesswork.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Customers describe the problem once and pick a date. Verified
            technicians compete for the job and move it through a strict status
            pipeline - <strong className="text-foreground">requested → accepted →
            in progress → completed</strong> - so everyone always knows exactly
            where things stand. Money only moves at the very end, through Stripe.
          </p>
          <Button asChild className="mt-2">
            <Link href="/services">Explore services</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {FACTS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mt-10">
        <h2 className="text-center text-xl font-bold sm:text-2xl">What we stand for</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="flex size-11 items-center justify-center rounded-lg bg-teal-500/12 text-teal-600 dark:text-teal-400">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="mt-10 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 p-6 text-center shadow-lg sm:p-10">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Two sides, one marketplace
        </h2>
        <div className="mx-auto mt-6 grid max-w-3xl gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl bg-white/10 p-5 ring-1 ring-inset ring-white/20">
            <h3 className="font-semibold text-white">Customers</h3>
            <p className="mt-1.5 text-sm text-teal-50/90">
              Browse services, book a visit, track every status change, pay only
              after the repair and leave a verified review.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-5 ring-1 ring-inset ring-white/20">
            <h3 className="font-semibold text-white">Technicians</h3>
            <p className="mt-1.5 text-sm text-teal-50/90">
              Publish services (approved by admins), accept jobs, move them
              through the pipeline and get paid for completed work.
            </p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" asChild>
            <Link href="/sign-up">Join FixMate</Link>
          </Button>
          <Button
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href="/services">Browse services</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
