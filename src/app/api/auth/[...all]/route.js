import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * BetterAuth endpoint catch-all:
 *   /api/auth/sign-in/email, /api/auth/sign-up/email, /api/auth/get-session ...
 */
export const { GET, POST } = toNextJsHandler(auth.handler);
