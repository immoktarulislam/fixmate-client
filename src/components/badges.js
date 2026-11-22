import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_BADGE, PAYMENT_BADGE, APPROVAL_BADGE, APPROVAL_LABELS, PAYMENT_LABELS, ROLE_LABELS } from "@/lib/constants";

/** Job status pill - blue / indigo / amber / green / red / gray per spec. */
export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_BADGE[status] || STATUS_BADGE.cancelled,
        className
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/** Paid / Unpaid pill. */
export function PaymentBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        PAYMENT_BADGE[paymentKey(status)] || PAYMENT_BADGE.unpaid,
        className
      )}
    >
      {PAYMENT_LABELS[paymentKey(status)] || status}
    </span>
  );
}

function paymentKey(status) {
  return status === "paid" ? "paid" : "unpaid";
}

/** Service approval pill (admin + technician views). */
export function ApprovalBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        APPROVAL_BADGE[status] || APPROVAL_BADGE.pending,
        className
      )}
    >
      {APPROVAL_LABELS[status] || status}
    </span>
  );
}

/** Role pill. */
export function RoleBadge({ role, className }) {
  const styles = {
    admin:
      "bg-purple-500/12 text-purple-600 dark:text-purple-400 ring-1 ring-inset ring-purple-500/30",
    technician:
      "bg-teal-500/12 text-teal-700 dark:text-teal-400 ring-1 ring-inset ring-teal-500/30",
    customer:
      "bg-blue-500/12 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[role] || styles.customer,
        className
      )}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}
