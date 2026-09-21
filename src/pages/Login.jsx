import { useEffect, useState } from "react";
import Field from "../components/auth/Field";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  ArrowIcon,
} from "../components/auth/Icons";
import { NavLink } from "react-router-dom";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.87-3.04.87-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.73A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.19.29-1.73V4.94H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.06l3.02-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.94l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.8 1.19 1.82 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55C20.21 21.39 23.5 17.08 23.5 12c0-6.27-5.23-11.5-11.5-11.5z" />
    </svg>
  );
}

// Small inline clock icon (no extra dependency needed)
function ClockIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// 75 -> "1:15", 9 -> "0:09"
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Backend message: "Too many login attempts. Please try again in {n} seconds."
// It has no separate "seconds" field, so we read the number from the message.
function parseRetrySeconds(err) {
  const text = err?.data?.message || err?.message || "";
  const match = String(text).match(/(\d+)\s*seconds?/i);
  return match ? parseInt(match[1], 10) : 60; // backend decay is 60s
}

export default function Login({
  onSubmit,
  onNavigateRegister,
  onGoogleSignup,
  onGithubSignup,
}) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- Rate-limit lockout (backend locks per email + IP) ---
  const [lockUntil, setLockUntil] = useState(null); // timestamp in ms
  const [lockedEmail, setLockedEmail] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Countdown. Uses the end timestamp so it stays accurate even if the
  // browser slows timers in a background tab.
  useEffect(() => {
    if (!lockUntil) {
      setSecondsLeft(0);
      return;
    }

    function tick() {
      const remaining = Math.max(
        0,
        Math.ceil((lockUntil - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);

      if (remaining === 0) {
        setLockUntil(null);
        setLockedEmail("");
      }
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  // The backend key is email + IP, so a different email is NOT locked.
  const isLocked =
    secondsLeft > 0 && form.email.trim().toLowerCase() === lockedEmail;

  function startLock(err) {
    const seconds = parseRetrySeconds(err);
    setLockedEmail(form.email.trim().toLowerCase());
    setLockUntil(Date.now() + seconds * 1000);
    setError("");
  }

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Also blocks submitting with the Enter key while locked
    if (isLocked) return;

    setError("");
    setSubmitting(true);

    try {
      await onSubmit?.(form, { remember });
    } catch (err) {
      if (err.status === 429) {
        // Too many attempts: lock the button and start the countdown
        startLock(err);
      } else if (err.status === 401) {
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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec] px-6 py-10">
      <div className="w-full max-w-sm">

        {/* Heading */}
        <div className="mb-7">
          <p className="text-[11px] tracking-[0.25em] font-semibold mb-3 text-[#b08a4a]">
            WELCOME BACK
          </p>

          <h1 className="font-serif text-3xl mb-2 text-[#1f2942]">
            Sign in to your account
          </h1>

          <p className="text-sm leading-6 text-[#7b8190]">
            Access your reservations, saved suites, and guest.
          </p>
        </div>

        {/* Social sign-in */}
        <div className="flex flex-col gap-3 mb-7">
          <button
            type="button"
            onClick={() => onGoogleSignup?.()}
            className="
              w-full flex items-center justify-center gap-2
              rounded-full py-3
              text-sm font-medium
              border border-[#ded9d0]
              bg-white
              text-[#374151]
              shadow-sm
              transition-all
              hover:border-[#c9b58b]
              hover:bg-[#fffdf9]
              hover:shadow-md
            "
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <button
            type="button"
            onClick={() => onGithubSignup?.()}
            className="
              w-full flex items-center justify-center gap-2
              rounded-full py-3
              text-sm font-medium
              border border-[#ded9d0]
              bg-white
              text-[#374151]
              shadow-sm
              transition-all
              hover:border-[#c9b58b]
              hover:bg-[#fffdf9]
              hover:shadow-md
            "
          >
            <GithubIcon />
            Sign in with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-7">
          <span className="flex-1 h-px bg-[#ddd8cf]" />

          <span className="text-[10px] uppercase tracking-[0.14em] text-[#a09a90] whitespace-nowrap">
            Or continue with email
          </span>

          <span className="flex-1 h-px bg-[#ddd8cf]" />
        </div>

        {/* Login form */}
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
                className="text-[#9a9da5] hover:text-[#b08a4a] transition-colors"
              >
                <EyeIcon open={showPassword} />
              </button>
            }
          />

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-8 text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-[#707786]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded-sm accent-[#b08a4a]"
              />
              Remember me
            </label>

            <NavLink
              to="/forgot-password"
              className="
                text-[#707786]
                hover:text-[#b08a4a]
                hover:underline
                transition-colors
              "
            >
              Forgot password?
            </NavLink>
          </div>

          {/* Rate-limit lockout banner */}
          {isLocked && (
            <div
              className="
                flex items-start gap-3 mb-4
                rounded-xl
                border border-amber-200
                bg-amber-50
                px-4 py-3
                text-sm text-amber-800
              "
              role="alert"
            >
              <ClockIcon size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-red-500">Too many login attempts</p>
                <p className="text-red-500">
                  Please try again in{" "}
                  <span className="font-semibold tabular-nums">
                    {formatTime(secondsLeft)}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !isLocked && (
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
            disabled={submitting || isLocked}
            className="
              w-full flex items-center justify-center gap-2
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
            {submitting ? (
              "Signing in…"
            ) : isLocked ? (
              <>
                <ClockIcon />
                Try again in {formatTime(secondsLeft)}
              </>
            ) : (
              <>
                Sign in
                <ArrowIcon />
              </>
            )}
          </button>
        </form>

        {/* Register */}
        <div className="pt-7 text-sm text-center text-[#7b8190]">
          New to Lumiere Grande?{" "}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="
              font-medium
              underline
              underline-offset-4
              text-[#a77f3f]
              hover:text-[#80602f]
              transition-colors
            "
          >
            Create an account
          </button>
        </div>

      </div>
    </div>
  );
}