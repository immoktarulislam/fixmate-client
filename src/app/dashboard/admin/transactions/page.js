import AuthGuard from "@/components/auth-guard";
import AdminTransactions from "@/components/dashboard/admin/transactions";

export const instant = false;
export const metadata = { title: "Transactions | FixMate" };

export default function AdminTransactionsPage() {
  return (
    <AuthGuard roles={["admin"]}>
      <AdminTransactions />
    </AuthGuard>
  );
}
