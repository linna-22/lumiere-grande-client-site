import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen flex items-center justify-center bg-[#191d39] px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-[11px] tracking-[0.2em] font-medium mb-3 text-amber-600">
          RESET PASSWORD
        </p>
        <h1 className="font-serif text-3xl mb-2 text-white">Forgot your password?</h1>
        <p className="text-sm mb-10 text-slate-500">
          Enter your email and we'll send you a 6-digit code to reset it.
        </p>

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
            <p className="text-sm mb-4 text-red-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide text-white bg-amber-600 transition-colors hover:bg-amber-700 disabled:opacity-60"
          >
            {submitting ? "Sending code…" : "Send reset code"}
            {!submitting && <ArrowIcon />}
          </button>
        </form>

        <div className="pt-6 text-sm  text-slate-500">
          Remembered it?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium underline underline-offset-4 text-amber-600"
          >
            Back to sign in
          </button> 
        </div>
      </div>
    </div>
  );
}
