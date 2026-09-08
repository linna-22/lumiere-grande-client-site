import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Lock, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/user";
import { showSuccessToast } from "../utils/toast";

export default function ChangePassword() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.new_password !== form.new_password_confirmation) {
      setError("New passwords don't match — check both fields and try again.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(form);
      showSuccessToast("Password changed successfully!");
      navigate("/");
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        const firstError = Object.values(err.data.errors)[0]?.[0];
        setError(firstError || "Please check your details and try again.");
      } else if (err.status === 401 || err.status === 403) {
        setError(err.data?.message || "Your current password is incorrect.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-24 sm:px-8">
      <h1 className="font-serif text-3xl text-slate-900">Change Password</h1>
      <p className="mt-2 text-sm text-slate-500">
        Choose a strong password you haven't used before.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Current Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.current_password}
              onChange={update("current_password")}
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-10 text-sm focus:border-amber-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            New Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.new_password}
              onChange={update("new_password")}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-10 text-sm focus:border-amber-500 focus:outline-none"
              placeholder="At least 8 characters"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.new_password_confirmation}
              onChange={update("new_password_confirmation")}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-10 text-sm focus:border-amber-500 focus:outline-none"
              placeholder="Re-enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-500" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-amber-700 disabled:opacity-60"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {submitting ? "Saving..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}