import { API_URL } from "./constants";

/** Error carrying the HTTP status so callers can branch on 401/403/etc. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const TOKEN_KEY = "fixmate_token";
const TOKEN_TTL = 4.5 * 60 * 1000; // BetterAuth sessions last 7d; we refresh every ~5min

/** Drops the cached JWT (called on sign-out). */
export function clearToken() {
  if (typeof window !== "undefined") sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * Fetches (and briefly caches) the JWT used to call the Express API.
 * The token is minted by /api/auth/token from the BetterAuth session cookie.
 */
export async function getToken() {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (raw) {
      const { token, exp } = JSON.parse(raw);
      if (token && exp > Date.now()) return token;
    }
  } catch {
    /* corrupted cache - fall through and refresh */
  }

  try {
    const res = await fetch("/api/auth/token", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.token) return null;
    sessionStorage.setItem(
      TOKEN_KEY,
      JSON.stringify({ token: data.token, exp: Date.now() + TOKEN_TTL })
    );
    return data.token;
  } catch {
    return null;
  }
}

/**
 * Universal API helper.
 *  - attaches the Bearer token when `auth` is true
 *  - parses the `{ message }` error envelope from the server
 *  - throws ApiError with `.status` on any non-2xx response
 *
 *   api("/services?category=AC&page=2")
 *   api("/bookings", { method: "POST", body: { serviceId } })
 */
export async function api(path, options = {}) {
  const { method = "GET", body, auth = true, headers = {} } = options;

  const finalHeaders = { ...headers };
  if (body !== undefined && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = await getToken();
    if (!token) {
      throw new ApiError("Please sign in to continue.", 401);
    }
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  // API_URL is the origin only; Express mounts everything under /api.
  const base = API_URL.replace(/\/+$/, "");
  const url = /^https?:\/\//.test(path)
    ? path
    : path.startsWith("/api/")
    ? `${base}${path}`
    : `${base}/api${path.startsWith("/") ? path : `/${path}`}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Could not reach the server. Please try again.", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    throw new ApiError(
      data?.message || `Request failed (${res.status}).`,
      res.status
    );
  }

  return data;
}
