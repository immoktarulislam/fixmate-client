/** Base URL of the Express API. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Application roles. `admin` is never selectable at sign-up. */
export const ROLES = {
  CUSTOMER: "customer",
  TECHNICIAN: "technician",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

/** Job status pipeline (mirrors the server-side TRANSITIONS map). */
export const BOOKING_STATUSES = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
];

export const STATUS_LABELS = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

/** Badge color per status: blue / indigo / amber / green / red / gray. */
export const STATUS_BADGE = {
  requested:
    "bg-blue-500/12 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/30",
  accepted:
    "bg-indigo-500/12 text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/30",
  "in-progress":
    "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-500/30",
  completed:
    "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/30",
  rejected:
    "bg-red-500/12 text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-500/30",
  cancelled:
    "bg-zinc-500/12 text-zinc-600 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/30",
};

export const PAYMENT_LABELS = { paid: "Paid", unpaid: "Unpaid" };

export const PAYMENT_BADGE = {
  paid: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/30",
  unpaid: "bg-zinc-500/12 text-zinc-600 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/30",
};

export const APPROVAL_LABELS = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

export const APPROVAL_BADGE = {
  pending:
    "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-500/30",
  approved:
    "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/30",
  rejected:
    "bg-red-500/12 text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-500/30",
};

/** Service categories - must match the server's CATEGORIES enum. */
export const CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

/** Short label + emoji used on the home category cards. */
export const CATEGORY_META = {
  Smartphone: { emoji: "📱", blurb: "Screens, batteries & charging ports" },
  "Laptop & PC": { emoji: "💻", blurb: "Diagnostics, upgrades & tune-ups" },
  AC: { emoji: "❄️", blurb: "Cooling, gas refill & servicing" },
  Refrigerator: { emoji: "🧊", blurb: "Cooling faults & thermostat fixes" },
  TV: { emoji: "📺", blurb: "Display, sound & smart TV issues" },
  "Washing Machine": { emoji: "🫧", blurb: "Drum, motor & drainage repair" },
  Electrical: { emoji: "⚡", blurb: "Wiring, sockets & lighting faults" },
};

export const SERVICE_MODES = ["Home Visit", "Shop Drop-off"];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

/** Public navbar links. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];
