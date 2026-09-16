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

  // No email in state means someone landed here directly.
  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  function handleChange(index, value) {
    const clean = value.replace(/\D/g, "").slice(-1);

    const next = [...digits];
    next[index] = clean;

    setDigits(next);
    setError("");

    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");

    pasted
      .split("")
      .forEach((char, i) => (next[i] = char));

    setDigits(next);

    inputRefs.current[
      Math.min(pasted.length, OTP_LENGTH) - 1
    ]?.focus();
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
      await verifyResetOtp({
        email,
        otp: code,
      });

      navigate("/reset-password", {
        state: {
          email,
          otp: code,
        },
      });
    } catch (err) {
      setError(
        err.data?.message ||
          err.message ||
          "Invalid code. Please try again."
      );
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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec] px-6 py-16">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.25em] font-semibold mb-3 text-[#b08a4a]">
            RESET PASSWORD
          </p>

          <h1 className="font-serif text-3xl mb-2 text-[#1f2942]">
            Enter your reset code
          </h1>

          <p className="text-sm leading-6 text-[#7b8190]">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-[#4b5563]">
              {maskEmail(email)}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* OTP Inputs */}
          <div
            className="flex items-center justify-center gap-2 sm:gap-3 mb-6"
            onPaste={handlePaste}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(index, e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                disabled={submitting}
                className="
                  w-11
                  h-13
                  sm:w-12
                  sm:h-14
                  text-center
                  text-xl
                  font-bold
                  rounded-xl
                  border
                  border-[#ddd8cf]
                  bg-white
                  text-black
                  caret-[#b08a4a]
                  outline-none
                  shadow-sm
                  transition-all
                  focus:border-[#b08a4a]
                  focus:ring-2
                  focus:ring-[#b08a4a]/10
                  disabled:opacity-60
                "
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              className="
                text-sm
                mb-4
                text-center
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-red-600
              "
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Verify */}
          <button
            type="submit"
            disabled={submitting}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              rounded-full
              py-3.5
              text-sm
              font-semibold
              tracking-wide
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
            {submitting ? "Verifying…" : "Verify code"}

            {!submitting && <ArrowIcon />}
          </button>

          {/* Resend */}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="
              w-full
              mt-5
              text-sm
              underline
              underline-offset-4
              text-[#7b8190]
              transition-colors
              hover:text-[#b08a4a]
              disabled:opacity-60
              disabled:no-underline
            "
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