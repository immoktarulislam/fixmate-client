import AuthGuard from "@/components/auth-guard";
import CustomerBookings from "@/components/dashboard/customer/bookings";

export const instant = false;
export const metadata = { title: "My Bookings | FixMate" };

export default function CustomerBookingsPage() {
  return (
    <AuthGuard roles={["customer"]}>
      <CustomerBookings />
    </AuthGuard>
  );
}
