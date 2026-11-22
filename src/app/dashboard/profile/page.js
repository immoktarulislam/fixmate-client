import AuthGuard from "@/components/auth-guard";
import ProfilePage from "@/components/dashboard/profile";

export const instant = false;
export const metadata = { title: "Profile | FixMate" };

export default function ProfileRoute() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  );
}
