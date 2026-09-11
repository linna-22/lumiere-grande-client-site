import { useState } from "react";
import Field from "../components/auth/Field";
import { MailIcon, LockIcon, EyeIcon, ArrowIcon } from "../components/auth/Icons";
import { NavLink } from "react-router-dom";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.8 1.19 1.82 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55C20.21 21.39 23.5 17.08 23.5 12c0-6.27-5.23-11.5-11.5-11.5z" />
    </svg>
  );
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
    <div className="min-h-screen flex items-center justify-center bg-[#191d39] px-6 py-5">
      <div className="w-full max-w-sm">
        <p className="text-[11px] tracking-[0.2em] font-medium mb-3 text-amber-600">
          WELCOME BACK
        </p>
        <h1 className="font-serif text-3xl mb-2 text-white">Sign in to your account</h1>
        <p className="text-sm mb-5 text-slate-500">
          Access your reservations, saved suites, and guest preferences.
        </p>

        {/* Social sign-in */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            onClick={() => onGoogleSignup?.()}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
          <button
            type="button"
            onClick={() => onGithubSignup?.()}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
          >
            <GithubIcon />
            Sign in with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="flex-1 h-px bg-slate-200" />
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Or continue with email
          </span>
          <span className="flex-1 h-px bg-slate-200" />
        </div>

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
                className="text-slate-400"
              >
                <EyeIcon open={showPassword} />
              </button>
            }
          />

          <div className="flex items-center justify-between mb-8 text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-500">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded-sm accent-amber-600"
              />
              Remember me
            </label>
            <NavLink to="/forgot-password" className="hover:underline text-slate-500">
              Forgot password?
            </NavLink>
          </div>

          {error && (
            <p className="text-sm mb-4 text-red-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide text-white bg-amber-600 transition-colors hover:bg-amber-700 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
            {!submitting && <ArrowIcon />}
          </button>
        </form>

        <div className="pt-6 text-sm text-slate-500">
          New to Lumiere Grande?{" "}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="font-medium underline underline-offset-4 text-amber-600"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
