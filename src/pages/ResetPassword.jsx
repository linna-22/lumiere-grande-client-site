import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import AuthLayout, { tokens } from "../components/auth/AuthLayout";
import Field from "../components/auth/Field";
import { LockIcon, EyeIcon, ArrowIcon } from "../components/auth/Icons";
import { resetPassword } from "../api/password";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, otp } = location.state || {};

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!email || !otp) return <Navigate to="/forgot-password" replace />;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords don't match — check both fields and try again.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({
        email,
        otp,
        password: form.password,
        password_confirmation: form.confirm,
      });
      navigate("/login");
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        const firstError = Object.values(err.data.errors)[0]?.[0];
        setError(firstError || "Please check your password and try again.");
      } else {
        setError(err.data?.message || err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="RESET PASSWORD"
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="NEW PASSWORD"
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

        {error && (
          <p className="text-sm mb-4" style={{ color: "#E88A8A" }} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide transition-colors disabled:opacity-60"
          style={{ backgroundColor: tokens.amber, color: tokens.ink }}
        >
          {submitting ? "Resetting…" : "Reset password"}
          {!submitting && <ArrowIcon />}
        </button>
      </form>
    </AuthLayout>
  );
}