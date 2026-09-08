import { useState } from "react";
import AuthLayout, { tokens } from "../components/auth/AuthLayout";
import Field from "../components/auth/Field";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  ArrowIcon,
} from "../components/auth/Icons";

export default function Login({ onSubmit, onNavigateRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit?.(form, { remember });
    } catch (err) {
      if (err.status === 401) {
        setError("Incorrect email or password.");
      } else if (err.status === 403) {
        setError(err.data?.message || "Your account is suspended.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in to your account"
      subtitle="Access your reservations, saved suites, and guest preferences."
      footer={
        <span>
          New to Lumiere Grande?{" "}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="font-medium underline underline-offset-4 decoration-[color:var(--amber)]"
            style={{ color: tokens.amber }}
          >
            Create an account
          </button>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="EMAIL ADDRESS"
          icon={<MailIcon />}
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          placeholder="you@example.com"
        />

        <Field
          label="PASSWORD"
          icon={<LockIcon />}
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={update("password")}
          placeholder="••••••••"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ color: tokens.muted }}
            >
              <EyeIcon open={showPassword} />
            </button>
          }
        />

        <div className="flex items-center justify-between mb-8 text-sm">
          <label>
            
          </label>
          <a
            href="#forgot-password"
            className="hover:underline"
            style={{ color: tokens.muted }}
          >
            Forgot password?
          </a>
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: "#E88A8A" }} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide transition-colors disabled:opacity-60"
          style={{ backgroundColor: tokens.amber, color: tokens.ink }}
        >
          {submitting ? "Signing in…" : "Sign in"}
          {!submitting && <ArrowIcon />}
        </button>
      </form>
    </AuthLayout>
  );
}
