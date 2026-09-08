import { DiamondMark } from "./Icons";

// Brand tokens — lifted from the Lumiere Grande hero (dusk indigo, amber accent,
// serif display + tracked sans). Kept here as arbitrary Tailwind values so this
// file works even if the host project's tailwind.config.js hasn't been extended.
const ink = "#0f0c18";       // page background, darkest
const panel = "#171224";      // brand panel base
const panel2 = "#241a38";     // brand panel gradient stop (plum)
const cream = "#F5F0E6";      // headline / primary text
const muted = "#A79FBE";      // secondary text
const amber = "#E8863A";      // accent — same hue as "BOOK NOW"
const hair = "rgba(245,240,230,0.12)"; // hairline dividers

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-serif text-2xl" style={{ color: amber }}>{value}</div>
      <div className="text-[11px] tracking-wide mt-1" style={{ color: muted }}>{label}</div>
    </div>
  );
}

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-5 font-sans" style={{ backgroundColor: ink }}>
      <style>{`
        @keyframes lg-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .lg-rise { animation: lg-rise 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .lg-rise { animation: none; } }
      `}</style>

      {/* Brand panel */}
      <div
        className="hidden lg:flex lg:col-span-2 relative flex-col justify-between overflow-hidden px-12 py-10"
        style={{ background: `linear-gradient(160deg, ${panel2} 0%, ${panel} 55%, ${ink} 100%)` }}
      >
        {/* thin palm-frond linework, echoes the hero photo without needing an image asset */}
        <svg
          viewBox="0 0 200 500"
          className="absolute -right-6 top-0 h-full w-40 opacity-[0.16] pointer-events-none"
          fill="none"
        >
          <path d="M170 500V160" stroke={cream} strokeWidth="1" />
          <path d="M170 190C150 170 120 165 95 175" stroke={cream} strokeWidth="1" />
          <path d="M170 220C145 205 115 202 90 215" stroke={cream} strokeWidth="1" />
          <path d="M170 250C150 230 175 210 200 215" stroke={cream} strokeWidth="1" />
          <path d="M170 160C160 130 165 95 190 70" stroke={cream} strokeWidth="1" />
          <path d="M170 160C180 130 175 95 155 68" stroke={cream} strokeWidth="1" />
        </svg>

        <a href="/" className="relative flex items-center gap-3" style={{ color: cream }}>
          <DiamondMark className="w-6 h-6" />
          <span className="font-serif text-xl tracking-wide">Lumiere Grande</span>
        </a>

        <div className="relative">
          <p className="text-[11px] tracking-[0.2em] font-medium mb-4" style={{ color: amber }}>
            A MEMBER OF THE LUMIERE COLLECTION
          </p>
          <h2 className="font-serif text-4xl leading-[1.15] max-w-sm" style={{ color: cream }}>
            Where every stay becomes a story worth returning to.
          </h2>
        </div>

        <div className="relative flex gap-10 pt-8" style={{ borderTop: `1px solid ${hair}` }}>
          <Stat value="18" label="Years of Excellence" />
          <Stat value="120+" label="Rooms & Suites" />
          <Stat value="4.9" label="Guest Rating" />
        </div>
      </div>

      {/* Form panel */}
      <div className="col-span-1 lg:col-span-3 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm lg-rise">
          <div className="lg:hidden flex items-center gap-3 mb-12 justify-center" style={{ color: cream }}>
            <DiamondMark className="w-6 h-6" />
            <span className="font-serif text-xl tracking-wide">Lumiere Grande</span>
          </div>

          {eyebrow && (
            <p className="text-[11px] tracking-[0.2em] font-medium mb-3" style={{ color: amber }}>
              {eyebrow}
            </p>
          )}
          <h1 className="font-serif text-3xl mb-2" style={{ color: cream }}>{title}</h1>
          {subtitle && <p className="text-sm mb-10" style={{ color: muted }}>{subtitle}</p>}

          {children}

          {footer && (
            <div className="mt-8 pt-6 text-sm" style={{ borderTop: `1px solid ${hair}`, color: muted }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const tokens = { ink, panel, panel2, cream, muted, amber, hair };
