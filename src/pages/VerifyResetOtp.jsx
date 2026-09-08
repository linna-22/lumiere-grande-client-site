import { useRef, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import AuthLayout, { tokens } from "../components/auth/AuthLayout";
import { ArrowIcon } from "../components/auth/Icons";
import { verifyResetOtp, forgotPassword } from "../api/password";

const OTP_LENGTH = 6;

export default function VerifyResetOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // No email in state means someone landed here directly — there's no
  // reset session to verify, so send them back to start over.
  if (!email) return <Navigate to="/forgot-password" replace />;

  function handleChange(index, value) {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError("");
    if (clean && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => (next[i] = char));
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await verifyResetOtp({ email, otp: code });
      navigate("/reset-password", { state: { email, otp: code } });
    } catch (err) {
      setError(err.data?.message || err.message || "Invalid code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError("");
    try {
      await forgotPassword(email);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="RESET PASSWORD"
      title="Enter your reset code"
      subtitle={
        <>
          We sent a 6-digit code to <span style={{ color: tokens.cream }}>{email}</span>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={submitting}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border focus:outline-none disabled:opacity-60"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: tokens.cream, backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm mb-4 text-center" style={{ color: "#E88A8A" }} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide transition-colors disabled:opacity-60"
          style={{ backgroundColor: tokens.amber, color: tokens.ink }}
        >
          {submitting ? "Verifying…" : "Verify code"}
          {!submitting && <ArrowIcon />}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full mt-4 text-sm underline underline-offset-4 disabled:opacity-60"
          style={{ color: tokens.muted }}
        >
          {resending ? "Resending…" : "Resend code"}
        </button>
      </form>
    </AuthLayout>
  );
}