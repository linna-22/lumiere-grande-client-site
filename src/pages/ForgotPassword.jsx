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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec] px-6 py-16">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.25em] font-semibold mb-3 text-[#b08a4a]">
            RESET PASSWORD
          </p>

          <h1 className="font-serif text-3xl mb-2 text-[#1f2942]">
            Forgot your password?
          </h1>

          <p className="text-sm leading-6 text-[#7b8190]">
            Enter your email and we'll send you a 6-digit code to reset it.
          </p>
        </div>

        {/* Form */}
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

          {/* Error */}
          {error && (
            <div
              className="
                text-sm mb-4
                rounded-xl
                border border-red-200
                bg-red-50
                px-4 py-3
                text-red-600
              "
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="
              w-full mt-2
              flex items-center justify-center gap-2
              rounded-full py-3.5
              text-sm font-semibold tracking-wide
              text-white
              bg-[#b08a4a]
              shadow-md
              transition-all
              hover:bg-[#967338]
              hover:shadow-lg
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {submitting ? "Sending code…" : "Send reset code"}
            {!submitting && <ArrowIcon />}
          </button>
        </form>

        {/* Back to Login */}
        <div className="pt-7 text-sm text-[#7b8190]">
          Remembered it?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="
              font-medium
              underline
              underline-offset-4
              text-[#a77f3f]
              hover:text-[#80602f]
              transition-colors
            "
          >
            Back to sign in
          </button>
        </div>

      </div>
    </div>
  );
}