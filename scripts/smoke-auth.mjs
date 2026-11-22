/* Re-run after auth.js changes: verifies role persistence + anti-escalation. */
const BASE = "http://localhost:3000";
const JSON_HEADERS = {
  "Content-Type": "application/json",
  Origin: BASE,
};

async function main() {
  const email = `smoke-${Date.now()}@example.com`;

  // 1. sign up as technician (role must be kept)
  const signup = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      name: "Smoke Tester",
      email,
      password: "Passw0rd!",
      role: "technician",
    }),
  });
  const signupBody = await signup.json().catch(() => null);
  console.log("signup technician:", signup.status, "role:", signupBody?.user?.role);

  // 2. sign in
  const signin = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password: "Passw0rd!" }),
  });
  const cookie = signin.headers.getSetCookie?.() || [];
  const sid = cookie.map((c) => c.split(";")[0]).join("; ");
  console.log("signin:", signin.status);

  // 3. escalate to admin via update-user (must be coerced to customer)
  const esc = await fetch(`${BASE}/api/auth/update-user`, {
    method: "POST",
    headers: { ...JSON_HEADERS, Cookie: sid },
    body: JSON.stringify({ role: "admin", name: "Smoke Tester" }),
  });
  console.log("update-user(escalate):", esc.status);

  // 4. fetch JWT + read the role from a fresh session
  const tok = await fetch(`${BASE}/api/auth/token`, {
    headers: { Cookie: sid, Origin: BASE },
  });
  console.log("token:", tok.status);

  const sess = await fetch(`${BASE}/api/auth/get-session`, {
    headers: { Cookie: sid, Origin: BASE },
  });
  const sessBody = await sess.json().catch(() => null);
  console.log("session role after escalation:", sessBody?.user?.role);

  console.log("SMOKE_EMAIL=" + email);
}

main().catch((err) => {
  console.error("SMOKE FAILED:", err);
  process.exit(1);
});
