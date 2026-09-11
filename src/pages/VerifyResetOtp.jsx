import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { ArrowIcon } from "../components/auth/Icons";
import { verifyResetOtp, forgotPassword } from "../api/password";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120; // seconds

function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 6);
  return `${visible}${"*".repeat(7)}@${domain}`;
}

export default function VerifyResetOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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
    if (cooldown > 0) return;
    setResending(true);
    setError("");
    try {
      await forgotPassword(email);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  const mm = String(Math.floor(cooldown / 60)).padStart(1, "0");
  const ss = String(cooldown % 60).padStart(2, "0");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191d39] px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-[11px] tracking-[0.2em] font-medium mb-3 text-amber-500">
          RESET PASSWORD
        </p>
        <h1 className="font-serif text-3xl mb-2 text-white">Enter your reset code</h1>
        <p className="text-sm mb-10 text-slate-400">
          We sent a 6-digit code to <span className="text-slate-200">{maskEmail(email)}</span>
        </p>

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
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border border-white/15 bg-white/5 text-white focus:outline-none focus:border-amber-500 disabled:opacity-60"
              />
            ))}
          </div>

          {error && (
            <p className="text-sm mb-4 text-center text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide text-[#191d39] bg-amber-500 transition-colors hover:bg-amber-400 disabled:opacity-60"
          >
            {submitting ? "Verifying…" : "Verify code"}
            {!submitting && <ArrowIcon />}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full mt-4 text-sm underline underline-offset-4 text-slate-400 disabled:opacity-60 disabled:no-underline"
          >
            {resending
              ? "Resending…"
              : cooldown > 0
              ? `Resend code in ${mm}:${ss}`
              : "Resend code"}
          </button>
        </form>
      </div>
    </div>
  );
}
