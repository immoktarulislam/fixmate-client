import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

/**
 * GET /api/auth/token
 * Exchanges the BetterAuth session cookie for a short-lived JWT that the
 * Express API accepts as `Authorization: Bearer <token>`.
 *
 * The payload only needs `sub` (the user's Mongo _id) - the API re-reads the
 * role from MongoDB on every request, so a stale role in the token is fine.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "BETTER_AUTH_SECRET is not configured" },
      { status: 500 }
    );
  }

  const token = jwt.sign(
    {
      sub: String(session.user.id),
      email: session.user.email || "",
      name: session.user.name || "",
    },
    secret,
    { expiresIn: "7d" }
  );

  return NextResponse.json({ token });
}
