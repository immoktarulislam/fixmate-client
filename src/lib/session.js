import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/** Read the BetterAuth session inside a server component / route handler. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Guard for role-restricted pages. Redirects anonymous users to sign-in and
 * bounces users with the wrong role back to their own dashboard.
 */
export async function requireRole(...roles) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in?redirect=/dashboard");
  }
  if (roles.length && !roles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}
