import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const mongoUri = process.env.BETTER_AUTH_URI;

if (!mongoUri) {
  throw new Error("BETTER_AUTH_URI is missing. Check your .env.local file.");
}

/**
 * The driver connects lazily on the first operation, so importing this module
 * during `next build` never opens a socket.
 */
const client = new MongoClient(mongoUri);
const db = client.db(process.env.BETTER_AUTH_DB || "fixmate");

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
const githubEnabled = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
);

/** Roles a user may assign to themselves at sign-up. `admin` is excluded. */
const SELF_ASSIGNABLE_ROLES = ["customer", "technician"];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, { client }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  ...(googleEnabled || githubEnabled
    ? {
        socialProviders: {
          ...(googleEnabled
            ? {
                google: {
                  clientId: process.env.GOOGLE_CLIENT_ID,
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                },
              }
            : {}),
          ...(githubEnabled
            ? {
                github: {
                  clientId: process.env.GITHUB_CLIENT_ID,
                  clientSecret: process.env.GITHUB_CLIENT_SECRET,
                },
              }
            : {}),
        },
      }
    : {}),

  /**
   * FixMate profile fields stored on BetterAuth's `user` document.
   * `input: true` lets sign-up send `role` (customer / technician only);
   * the database hook below is the real gate.
   *
   * NOTE: in BetterAuth v1 additional fields are read from
   * `options.user.additionalFields` (see dist/db/schema.mjs), not top-level.
   */
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: true,
        defaultValue: "customer",
        /**
         * Runs in parseUserInput for BOTH create (sign-up) and update
         * (/api/auth/update-user). Anything that is not customer/technician -
         * e.g. a forged `role: "admin"` - is coerced to `customer`, so a user
         * can never escalate their own role. (databaseHooks update.before
         * cannot delete keys: its return value is spread over the original
         * payload, so omitting `role` would leave it untouched.)
         */
        transform: {
          input: (value) =>
            SELF_ASSIGNABLE_ROLES.includes(value) ? value : "customer",
        },
      },
      phone: { type: "string", required: false, input: true, defaultValue: "" },
      area: { type: "string", required: false, input: true, defaultValue: "" },
      bio: { type: "string", required: false, input: true, defaultValue: "" },
      // Never writable from any user-facing endpoint.
      plan: { type: "string", required: false, input: false, defaultValue: "free" },
    },
  },

  databaseHooks: {
    user: {
      create: {
        /**
         * Defense in depth: even if a future code path skips the input
         * transform, a created user can never be anything but
         * customer / technician. `admin` accounts are promoted by the
         * Express admin API writing directly to MongoDB.
         */
        before: (user) => {
          const role = SELF_ASSIGNABLE_ROLES.includes(user?.role)
            ? user.role
            : "customer";
          return { data: { ...user, role } };
        },
      },
    },
  },
});
