# FixMate — Client (Next.js)

The customer-facing FixMate web app: a smart device & home appliance repair
marketplace with role-based dashboards, a full booking pipeline and
pay-after-service Stripe checkout.

> Server lives in [`fixmate-server`](../fixmate-server) (Express + MongoDB).
> This README covers the Next.js app only.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run seed                   # demo accounts, 13 services, bookings, payments
npm run dev                    # http://localhost:3000
```

The Express API must also be running on `http://localhost:5000`
(`cd ../fixmate-server && npm run dev`), otherwise public pages show a friendly
"server unreachable" message instead of data.

### Test accounts (created by `npm run seed`)

| Role       | Email              | Password    |
| ---------- | ------------------ | ----------- |
| Admin      | admin@fixmate.dev  | Fixmate@123 |
| Technician | rahim@fixmate.dev  | Fixmate@123 |
| Technician | karim@fixmate.dev  | Fixmate@123 |
| Customer   | sumaiya@fixmate.dev| Fixmate@123 |
| Customer   | tanvir@fixmate.dev | Fixmate@123 |

`npm run seed` is idempotent — it wipes previously seeded demo data and
recreates it, so you can run it any time.

---

## Environment variables (`.env.local` — never committed)

| Key | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | BetterAuth signing secret. **Must equal `JWT_SECRET` on the server.** |
| `BETTER_AUTH_URL` / `BETTER_AUTH_URI` / `BETTER_AUTH_DB` | App URL, MongoDB Atlas connection string, database name (`fixmate`). |
| `NEXT_PUBLIC_API_URL` | Express API base URL (`http://localhost:3000` locally, your Render URL in production). |
| `NEXT_PUBLIC_APP_URL` | Public app URL (used by BetterAuth redirects). |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Optional. Service-image uploads; falls back to a local base64 image if empty. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional social sign-in (buttons render only when set). |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional social sign-in. |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Turbopack dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run seed` | Seed MongoDB with demo users/services/bookings/payments |

---

## Architecture

```
Browser ── BetterAuth session cookie ──▶ Next.js /api/auth/* (MongoDB adapter)
   │
   ├─ GET /api/auth/token   → mints a short-lived JWT signed with BETTER_AUTH_SECRET
   │
   └─ Authorization: Bearer <jwt> ──▶ Express API (fixmate-server)
                                        └─ re-reads the user's role from MongoDB
                                           on every request (no stale permissions)
```

* **Auth**: BetterAuth (email/password + optional Google/GitHub), MongoDB
  adapter, `user` collection extended with `role`, `phone`, `area`, `bio`, `plan`.
* **Role safety**: `role` has an input transform that coerces anything except
  `customer`/`technician` to `customer`, so a forged `role: "admin"` in
  `update-user` is silently downgraded. Admins are promoted by the server.
* **Images**: plain `<img>` for dynamic service photos (no remotePatterns
  configuration needed), local SVG artwork in `/public/services`.

## Feature checklist

**Challenges**

1. **Search / filter / sort / pagination** — executed in MongoDB with
   `.skip()` / `.limit()` (`GET /api/services?search&category&mode&sort&page&limit`).
   Filter state lives in the URL, so it survives reloads and back/forward, and
   the home-page category cards open a pre-filtered `/services?category=…`.
2. **Ratings & reviews** — customers rate *after* payment; averages are
   recomputed and stored on the service document.
3. **Status history timeline** — every transition is appended to
   `booking.statusHistory` with actor + timestamp and rendered as a timeline.
4. **Server-side pagination** — page controls render from `{ total, page, totalPages }`.
5. **PDF invoice + theme toggle** — jsPDF invoices from payments and
   transactions pages, dark/light mode via `next-themes`.

**Optional requirements** 2–5 are implemented (see above). Requirement 1
(Pro subscription) is intentionally out of scope — the `plan` field exists but
is never writable from a user-facing endpoint.

## Project structure

```
src/
├─ app/
│  ├─ (public)/           home, services, about, sign-in/up, payment/{success,cancel}
│  ├─ dashboard/          layout + AuthGuard + role areas
│  │  ├─ customer/        overview, bookings, payments
│  │  ├─ technician/      overview, add-service, services, requests
│  │  └─ admin/           overview, users, services, bookings, transactions
│  ├─ api/auth/[...all]/  BetterAuth handler
│  ├─ api/auth/token/     JWT minting for the Express API
│  ├─ error.js  not-found.js  loading.js   custom error/404/loading pages
├─ components/            ui primitives (shadcn-style), navbar, footer, charts…
├─ lib/                   auth, auth-client, api, constants, validation, session, invoice
└─ scripts/seed.mjs       demo data generator
```

## Deploying to Vercel

1. Push this repo to GitHub and import it at [vercel.com/new](https://vercel.com/new)
   (Framework preset: **Next.js**, no custom build settings needed).
2. Add the environment variables from the table above for **Production**:
   * `BETTER_AUTH_SECRET` = the server's `JWT_SECRET`
   * `BETTER_AUTH_URL` = `https://your-app.vercel.app`
   * `BETTER_AUTH_URI` / `BETTER_AUTH_DB` = your Atlas connection string / `fixmate`
   * `NEXT_PUBLIC_API_URL` = `https://your-api.onrender.com`
   * `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
3. Deploy. Then update `BETTER_AUTH_URL`, `CLIENT_URL` and
   `ALLOWED_ORIGINS` on the server to the Vercel domain so BetterAuth's
   origin checks and CORS pass.
4. Seed once against production Atlas: `npm run seed` locally with the
   production `BETTER_AUTH_URI`.

Stripe webhook setup is documented in
[`fixmate-server/README.md`](../fixmate-server/README.md).
