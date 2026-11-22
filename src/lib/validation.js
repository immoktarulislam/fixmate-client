/** Password rules from the spec: >=6 chars, >=1 uppercase, >=1 lowercase. */
export function validatePassword(password = "") {
  const errors = [];
  if (password.length < 6) errors.push("at least 6 characters");
  if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
  return { ok: errors.length === 0, errors };
}

/** Human sentence for the field hint. */
export function passwordHint(password = "") {
  const { ok, errors } = validatePassword(password);
  if (ok) return "Password looks good ✓";
  return `Must include ${errors.join(", ")}`;
}

/** Minimal email sanity check (BetterAuth validates again server-side). */
export function validateEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Booking form checks - mirrors the server's createBooking validation. */
export function validateBookingForm(form) {
  const errors = {};
  if (!String(form.phone || "").trim()) errors.phone = "Phone number is required";
  if (!String(form.address || "").trim()) errors.address = "Address is required";
  if (!form.preferredDate) errors.preferredDate = "Pick a preferred date";
  else {
    const d = new Date(form.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime()) || d < today) {
      errors.preferredDate = "Date cannot be in the past";
    }
  }
  const desc = String(form.problemDescription || "").trim();
  if (desc.length < 20) {
    errors.problemDescription = `Describe the problem in at least 20 characters (${desc.length}/20)`;
  }
  return errors;
}
