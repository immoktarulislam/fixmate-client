import { jsPDF } from "jspdf";

const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;

/**
 * Optional requirement #5: generates a downloadable PDF invoice for a payment.
 * Pure client-side with jsPDF, so no extra endpoint is needed.
 */
export function downloadInvoice(payment = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Brand bar
  doc.setFillColor(13, 148, 136); // teal-600
  doc.rect(0, 0, pageWidth, 96, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("FixMate", 40, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Smart device & home appliance repair", 40, 68);
  doc.setFontSize(10);
  doc.text("INVOICE", pageWidth - 40, 48, { align: "right" });

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);

  const rows = [
    ["Invoice no.", payment.transactionId || payment.stripeSessionId || "—"],
    ["Issued", payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "—"],
    ["Customer", payment.customerName || "—"],
    ["Customer email", payment.customerEmail || "—"],
    ["Technician", payment.technicianName || "—"],
    ["Service", payment.serviceTitle || "Repair service"],
    ["Booking ID", payment.bookingId || "—"],
    ["Payment status", (payment.paymentStatus || "paid").toUpperCase()],
    ["Currency", (payment.currency || "usd").toUpperCase()],
  ];

  let y = 140;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(label, 40, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(String(value), 220, y);
    y += 22;
  });

  // Total box
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(40, y + 10, pageWidth - 80, 54, 8, 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(11);
  doc.text("Total paid", 56, y + 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(13, 148, 136);
  doc.text(money(payment.amount), pageWidth - 56, y + 43, { align: "right" });

  // Footer note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Thank you for using FixMate. This invoice was generated automatically after a successful Stripe payment.",
    40,
    y + 100
  );
  doc.text("fixmate.example.com", 40, y + 116);

  const safe = (payment.serviceTitle || "service").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`fixmate-invoice-${safe}.pdf`);
}
