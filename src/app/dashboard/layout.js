import AuthGuard from "@/components/auth-guard";
import DashboardShell from "@/components/dashboard/shell";

export const metadata = {
  title: "Dashboard | FixMate",
};

// Session-gated UI: navigation resolves the auth state client-side.
export const instant = false;

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
