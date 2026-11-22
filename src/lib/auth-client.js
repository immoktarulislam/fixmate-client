import { createAuthClient } from "better-auth/react";

/**
 * Public base URL resolver:
 * In the browser, window.location.origin guarantees that requests ALWAYS go
 * to the current deployed origin (never hardcoded to localhost:3000), preventing
 * 'Failed to fetch' errors caused by mixed content or wrong targets.
 */
const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});

export const { signIn, signUp, useSession, signOut, updateUser } = authClient;
