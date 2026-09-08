import { useState } from "react";
import AuthLayout, { tokens } from "../components/auth/AuthLayout";
import Field from "../components/auth/Field";
import {
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  ArrowIcon,
} from "../components/auth/Icons";

export default function Register({ onSubmit, onNavigateLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords don't match — check both fields and try again.");
      return;
    }
    if (!agree) {
      setError("Accept the terms and privacy policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit?.(form);
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        const firstError = Object.values(err.data.errors)[0]?.[0];
        setError(firstError || "Please check your details and try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <AuthLayout
      eyebrow="JOIN THE COLLECTION"
      title="Create your account"
      subtitle="Faster booking, member rates, and a record of every stay."
      footer={
        <span>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="font-medium underline underline-offset-4"
            style={{ color: tokens.amber }}
          >
            Sign in
          </button>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="FULL NAME"
          icon={<UserIcon />}
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={update("name")}
          placeholder="Enter your full name"
        />

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
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          placeholder="At least 8 characters"
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

        <Field
          label="CONFIRM PASSWORD"
          icon={<LockIcon />}
          type={showPassword ? "text" : "password"}
          name="confirm"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update("confirm")}
          placeholder="Re-enter your password"
        />

        <label
          className="flex items-start gap-2 mb-2 text-sm cursor-pointer"
          style={{ color: tokens.muted }}
        >
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded-sm bg-transparent"
            style={{ accentColor: tokens.amber }}
          />
          <span>
            I agree to the{" "}
            <a
              href="#terms"
              className="underline"
              style={{ color: tokens.cream }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#privacy"
              className="underline"
              style={{ color: tokens.cream }}
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>

        {error && (
          <p className="text-sm mb-4" style={{ color: "#E88A8A" }} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide transition-colors disabled:opacity-60"
          style={{ backgroundColor: tokens.amber, color: tokens.ink }}
        >
          {submitting ? "Creating account…" : "Create account"}
          {!submitting && <ArrowIcon />}
        </button>
      </form>
    </AuthLayout>
  );
}
