import AuthGuard from "@/components/auth-guard";
import AdminBookings from "@/components/dashboard/admin/bookings";

export const instant = false;
export const metadata = { title: "Bookings | FixMate" };

export default function AdminBookingsPage() {
  return (
    <AuthGuard roles={["admin"]}>
      <AdminBookings />
    </AuthGuard>
  );
}
