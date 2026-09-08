// Small inline icon set — no external icon package required.
// Keeps the auth pages drop-in ready for any Vite + Tailwind project.

export function DiamondMark({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 9L8 3H16L20 9L12 21L4 9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M4 9H20M8 3L12 9L16 3M12 9L8.5 9M12 9L15.5 9" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

export function MailIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3.5 6.5h17a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 7l9 6.2L21 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 10.5V7.8a4.5 4.5 0 0 1 9 0v2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 20c1.4-3.7 4.2-5.6 7.5-5.6s6.1 1.9 7.5 5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function EyeIcon({ open, className = "w-[18px] h-[18px]" }) {
  if (!open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3 12s3.8-6.5 9-6.5 9 6.5 9 6.5-3.8 6.5-9 6.5S3 12 3 12Z" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3.5 3.5l17 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.9 5.7A8.9 8.9 0 0 1 12 5.5c5.2 0 9 6.5 9 6.5a15.6 15.6 0 0 1-3.4 3.9M6.6 7.4C4.4 8.9 3 12 3 12s3.8 6.5 9 6.5c1.3 0 2.4-.2 3.4-.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.9 12a2.6 2.6 0 0 0 3.9 2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
