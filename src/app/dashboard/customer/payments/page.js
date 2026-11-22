import AuthGuard from "@/components/auth-guard";
import CustomerPayments from "@/components/dashboard/customer/payments";

export const instant = false;
export const metadata = { title: "Payments | FixMate" };

export default function CustomerPaymentsPage() {
  return (
    <AuthGuard roles={["customer"]}>
      <CustomerPayments />
    </AuthGuard>
  );
}
