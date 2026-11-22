import AuthGuard from "@/components/auth-guard";
import TechnicianOverview from "@/components/dashboard/overviews/technician";

export const instant = false;
export const metadata = { title: "Overview | FixMate" };

export default function TechnicianDashboardPage() {
  return (
    <AuthGuard roles={["technician"]}>
      <TechnicianOverview />
    </AuthGuard>
  );
}
