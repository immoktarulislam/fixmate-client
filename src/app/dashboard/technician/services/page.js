import AuthGuard from "@/components/auth-guard";
import TechnicianServices from "@/components/dashboard/technician/services";

export const instant = false;
export const metadata = { title: "My Services | FixMate" };

export default function TechnicianServicesPage() {
  return (
    <AuthGuard roles={["technician"]}>
      <TechnicianServices />
    </AuthGuard>
  );
}
