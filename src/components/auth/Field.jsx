import { tokens } from "./AuthLayout";

export default function Field({
  label,
  icon,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  rightElement,
  autoComplete,
}) {
  return (
    <label className="block mb-6">
      <span className="block text-xs tracking-wide mb-2" style={{ color: tokens.muted }}>
        {label}
      </span>
      <div
        className="flex items-center gap-3 pb-2 border-b transition-colors focus-within:border-current"
        style={{ borderColor: tokens.hair, color: tokens.amber }}
      >
        <span style={{ color: tokens.muted }}>{icon}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent outline-none text-sm py-1"
          style={{ color: tokens.cream, caretColor: tokens.amber }}
        />
        {rightElement}
      </div>
    </label>
  );
}
