"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRound, Lock, Save, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useSession, authClient } from "@/lib/auth-client";
import { validatePassword, passwordHint } from "@/lib/validation";
import { RoleBadge } from "@/components/badges";
import { PageHeader, Panel, ErrorNote } from "@/components/dashboard/parts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import ImageUpload from "@/components/image-upload";

export default function ProfilePage() {
  const { data: session, refetch } = useSession();
  const user = session?.user;

  const [form, setForm] = useState({ name: "", phone: "", area: "", bio: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      area: user.area || "",
      bio: user.bio || "",
      image: user.image || "",
    });
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-8 w-8 text-teal-600" />
      </div>
    );
  }

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setProfileError("");
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }
    setSaving(true);
    setProfileError("");
    try {
      await api("/users/profile", {
        method: "PATCH",
        body: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          area: form.area.trim(),
          bio: form.bio.trim(),
          image: form.image || null,
        },
      });
      await refetch(); // refresh the navbar/session with the new values
      toast.success("Profile updated");
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwdError("");

    const check = validatePassword(pwd.next);
    if (!check.ok) {
      setPwdError(`New password must include ${check.errors.join(", ")}`);
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdError("New passwords do not match");
      return;
    }
    if (!pwd.current) {
      setPwdError("Enter your current password");
      return;
    }

    setPwdBusy(true);
    try {
      const res = await authClient.changePassword({
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      if (res.error) {
        setPwdError(res.error.message || "Could not change the password");
        return;
      }
      setPwd({ current: "", next: "", confirm: "" });
      toast.success("Password changed");
    } catch (err) {
      setPwdError(err.message || "Could not change the password");
    } finally {
      setPwdBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage how you appear to technicians, customers and admins."
      />

      <ErrorNote message={profileError} onRetry={() => setProfileError("")} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity card */}
        <Panel className="h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-40">
              <ImageUpload value={form.image} onChange={(v) => set("image", v)} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              {user.name || "Unnamed"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <RoleBadge role={user.role} />
              <span className="text-xs text-slate-400">
                {user.createdAt
                  ? `since ${new Date(user.createdAt).getFullYear()}`
                  : "new member"}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              {user.role === "admin"
                ? "You administer the FixMate marketplace."
                : user.role === "technician"
                ? "You sell repair services; admin approves your listings."
                : "You book repairs and pay after completion."}
            </p>
            <p className="flex items-center gap-2">
              <UserRound className="h-3.5 w-3.5 text-teal-600" />
              Role changes are applied instantly by the server.
            </p>
          </div>
        </Panel>

        <div className="space-y-6 lg:col-span-2">
          {/* Editable details */}
          <Panel>
            <h2 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Details</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="pf-name">Full name</Label>
                  <Input
                    id="pf-name"
                    className="mt-1.5"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="pf-email">Email</Label>
                  <Input
                    id="pf-email"
                    className="mt-1.5"
                    value={user.email}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="pf-phone">Phone</Label>
                  <Input
                    id="pf-phone"
                    className="mt-1.5"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+880 1XXX XXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="pf-area">Area</Label>
                  <Input
                    id="pf-area"
                    className="mt-1.5"
                    value={form.area}
                    onChange={(e) => set("area", e.target.value)}
                    placeholder="e.g. Dhanmondi, Dhaka"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="pf-bio">Bio</Label>
                  <Textarea
                    id="pf-bio"
                    rows={3}
                    className="mt-1.5"
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="A short line about you (shown to customers on service pages)"
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </Panel>

          {/* Password */}
          <Panel>
            <h2 className="mb-1 font-semibold text-slate-800 dark:text-slate-100">Password</h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {pwd.next
                ? passwordHint(pwd.next)
                : "Minimum 6 characters with one uppercase and one lowercase letter."}
            </p>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="pf-cur">Current</Label>
                  <Input
                    id="pf-cur"
                    type="password"
                    autoComplete="current-password"
                    className="mt-1.5"
                    value={pwd.current}
                    onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pf-new">New</Label>
                  <Input
                    id="pf-new"
                    type="password"
                    autoComplete="new-password"
                    className="mt-1.5"
                    value={pwd.next}
                    onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pf-conf">Confirm</Label>
                  <Input
                    id="pf-conf"
                    type="password"
                    autoComplete="new-password"
                    className="mt-1.5"
                    value={pwd.confirm}
                    onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                  />
                </div>
              </div>
              {pwdError && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{pwdError}</p>
              )}
              <Button type="submit" variant="outline" disabled={pwdBusy}>
                <Lock className="mr-2 h-4 w-4" />
                {pwdBusy ? "Updating…" : "Change password"}
              </Button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
