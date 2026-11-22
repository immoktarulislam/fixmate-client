import AuthGuard from "@/components/auth-guard";
import TechnicianRequests from "@/components/dashboard/technician/requests";

export const instant = false;
export const metadata = { title: "Job Requests | FixMate" };

export default function TechnicianRequestsPage() {
  return (
    <AuthGuard roles={["technician"]}>
      <TechnicianRequests />
    </AuthGuard>
  );
}
