import AuthGuard from "@/components/auth-guard";
import AdminOverview from "@/components/dashboard/overviews/admin";

export const instant = false;
export const metadata = { title: "Overview | FixMate" };

export default function AdminDashboardPage() {
  return (
    <AuthGuard roles={["admin"]}>
      <AdminOverview />
    </AuthGuard>
  );
}
