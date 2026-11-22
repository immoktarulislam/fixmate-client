import AuthGuard from "@/components/auth-guard";
import CustomerOverview from "@/components/dashboard/overviews/customer";

export const instant = false;
export const metadata = { title: "Overview | FixMate" };

export default function CustomerDashboardPage() {
  return (
    <AuthGuard roles={["customer"]}>
      <CustomerOverview />
    </AuthGuard>
  );
}
