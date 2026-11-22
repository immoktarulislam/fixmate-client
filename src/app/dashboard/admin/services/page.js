import AuthGuard from "@/components/auth-guard";
import AdminServices from "@/components/dashboard/admin/services";

export const instant = false;
export const metadata = { title: "Service Moderation | FixMate" };

export default function AdminServicesPage() {
  return (
    <AuthGuard roles={["admin"]}>
      <AdminServices />
    </AuthGuard>
  );
}
