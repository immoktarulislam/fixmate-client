import AuthGuard from "@/components/auth-guard";
import AdminUsers from "@/components/dashboard/admin/users";

export const instant = false;
export const metadata = { title: "Users | FixMate" };

export default function AdminUsersPage() {
  return (
    <AuthGuard roles={["admin"]}>
      <AdminUsers />
    </AuthGuard>
  );
}
