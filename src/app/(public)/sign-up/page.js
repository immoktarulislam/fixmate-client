"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { signUp } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import { validateEmail, validatePassword, passwordHint } from "@/lib/validation";
import { landingFor, dashboardFor } from "@/lib/role";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Wrench, ShoppingBag, Check } from "lucide-react";

const ROLE_OPTIONS = [
  {
    value: "customer",
    icon: ShoppingBag,
    title: "Customer",
    text: "Book repairs and track jobs",
  },
  {
    value: "technician",
    icon: Wrench,
    title: "Technician",
    text: "Offer services and take jobs",
  },
  // NOTE: `admin` is intentionally NOT selectable - the server also forces
  // anything that isn't customer/technician down to `customer`.
];

function SignUpForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const callback = params.get("callback");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "customer",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your full name";
    if (!validateEmail(form.email)) errs.email = "Enter a valid email address";
    const pw = validatePassword(form.password);
    if (!pw.ok) errs.password = `Password needs ${pw.errors.join(", ")}`;
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;

    setPending(true);
    try {
      const res = await signUp.email({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        // Server normalizes anything that isn't customer/technician → customer.
        role: form.role,
      });
      if (res.error) {
        const msg = res.error.message || "Could not create the account";
        if (/already|exists|taken/i.test(msg)) {
          setErrors({ email: "An account with this email already exists" });
        } else if (/password/i.test(msg)) {
          setErrors({ password: msg });
        } else {
          toast.error(msg);
        }
        return;
      }
      clearToken();
      toast.success("Account created - welcome to FixMate!");
      router.push(
        callback && callback.startsWith("/")
          ? callback
          : dashboardFor(res.data?.user?.role || form.role)
      );
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Could not create the account");
    } finally {
      setPending(false);
    }
  }

  const pwLive = form.password ? validatePassword(form.password) : null;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-5 text-xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free forever - pay only after a repair is done.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          {/* Role picker - admin is not an option */}
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">I want to join as</legend>
            <div className="grid grid-cols-2 gap-2.5 pt-1.5">
              {ROLE_OPTIONS.map((opt) => {
                const active = form.role === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("role", opt.value)}
                    aria-pressed={active}
                    className={cn(
                      "relative rounded-xl border p-3 text-left transition-all",
                      active
                        ? "border-primary bg-primary/8 ring-2 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <opt.icon
                      className={cn(
                        "size-5",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <p className="mt-2 text-sm font-semibold">{opt.title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {opt.text}
                    </p>
                    {active && (
                      <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                autoComplete="name"
                placeholder="Jane Doe"
                className="pl-9"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
            </div>
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{errors.name}</p>
            )}
          </div>

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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 characters"
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
            {errors.password ? (
              <p className="text-xs font-medium text-destructive">{errors.password}</p>
            ) : (
              <p
                className={cn(
                  "text-xs",
                  pwLive?.ok ? "text-emerald-600" : "text-muted-foreground"
                )}
              >
                {passwordHint(form.password)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="pl-9"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                aria-invalid={Boolean(errors.confirm)}
              />
            </div>
            {errors.confirm && (
              <p className="text-xs font-medium text-destructive">{errors.confirm}</p>
            )}
          </div>

          <Button className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Spinner /> Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/sign-in${callback ? `?callback=${encodeURIComponent(callback)}` : ""}`}
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Admin accounts are created by the platform team only.
      </p>
    </div>
  );
}

/** /sign-up - useSearchParams needs a Suspense boundary (Next 16 + cacheComponents). */
export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
