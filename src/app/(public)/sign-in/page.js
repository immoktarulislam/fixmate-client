"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import { validateEmail } from "@/lib/validation";
import { landingFor } from "@/lib/role";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.96H1.26v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.28 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.26a12 12 0 0 0 0 10.76l4.02-3.11Z" />
      <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.62l4.02 3.11C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.18-.02-2.14-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function SignInForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const callback = params.get("callback");

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!validateEmail(form.email)) errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setPending(true);
    try {
      const res = await signIn.email({
        email: form.email.trim(),
        password: form.password,
      });
      if (res.error) {
        const msg = res.error.message || "Could not sign in";
        if (/password/i.test(msg)) setErrors({ password: "Incorrect email or password" });
        else setErrors({ email: msg });
        toast.error(msg);
        return;
      }
      clearToken(); // drop any cached JWT from a previous account
      toast.success(`Welcome back, ${res.data?.user?.name || ""}!`.trim());
      router.push(landingFor(res.data?.user, callback));
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  async function social(provider) {
    setSocialPending(provider);
    try {
      const res = await signIn.social({
        provider,
        callbackURL: landingFor(null, callback),
      });
      if (res.error) {
        toast.error(res.error.message || `${provider} sign-in failed`);
        setSocialPending("");
      }
      // on success the browser is redirected to the provider
    } catch {
      toast.error(`${provider} sign-in failed`);
      setSocialPending("");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-5 text-xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to book repairs, track jobs and pay invoices.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="outline"
            onClick={() => social("google")}
            disabled={Boolean(socialPending)}
          >
            {socialPending === "google" ? (
              <Spinner />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => social("github")}
            disabled={Boolean(socialPending)}
          >
            {socialPending === "github" ? (
              <Spinner />
            ) : (
              <GitHubIcon className="size-4" />
            )}
            GitHub
          </Button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="pl-9"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={Boolean(errors.email)}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-9 pr-10"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-destructive">{errors.password}</p>
            )}
          </div>

          <Button className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Spinner /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          New to FixMate?{" "}
          <Link
            href={`/sign-up${callback ? `?callback=${encodeURIComponent(callback)}` : ""}`}
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Test accounts are listed in the README.
      </p>
    </div>
  );
}

/** /sign-in - useSearchParams needs a Suspense boundary (Next 16 + cacheComponents). */
export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
