import { useState } from "react";

export default function PasswordField({ label = "Password", name = "password", autoComplete = "current-password", ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={name} className="text-xs tracking-widest2 text-stone block mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          {...rest}
          className="w-full bg-transparent border border-ink/20 pl-4 pr-11 py-3 text-sm focus:border-brass outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 h-full px-3 text-stone hover:text-ink transition-colors"
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 002.8 2.8" />
              <path d="M9.4 5.5A9.9 9.9 0 0112 5c5 0 9 4 10 7-0.4 1.1-1.2 2.4-2.3 3.6M6.5 6.5C4.6 7.8 3.1 9.6 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
