import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout, { tokens } from "../components/auth/AuthLayout";
import Field from "../components/auth/Field";
import { MailIcon, ArrowIcon } from "../components/auth/Icons";
import { forgotPassword } from "../api/password";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email);
      navigate("/verify-reset-otp", { state: { email } });
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        const firstError = Object.values(err.data.errors)[0]?.[0];
        setError(firstError || "That email isn't registered.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="RESET PASSWORD"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a 6-digit code to reset it."
      footer={
        <span>
          Remembered it?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium underline underline-offset-4"
            style={{ color: tokens.amber }}
          >
            Back to sign in
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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
          {submitting ? "Sending code…" : "Send reset code"}
          {!submitting && <ArrowIcon />}
        </button>
      </form>
    </AuthLayout>
  );
}