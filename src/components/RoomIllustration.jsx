// Hand-drawn line-art motifs standing in for photography, one per room
// category. Keeping the imagery illustrative (rather than stock photos)
// lets the palette stay consistent across every card and detail page.
const variants = {
  arch: (
    <>
      <path d="M40 260 V150 A60 60 0 0 1 160 150 V260" />
      <path d="M60 260 V160 A40 40 0 0 1 140 160 V260" />
      <line x1="20" y1="260" x2="180" y2="260" />
      <circle cx="100" cy="120" r="3" fill="currentColor" stroke="none" />
      <path d="M220 90 L260 260 M300 90 L260 260" />
      <line x1="230" y1="180" x2="290" y2="180" />
    </>
  ),
  window: (
    <>
      <rect x="70" y="60" width="180" height="200" rx="2" />
      <line x1="160" y1="60" x2="160" y2="260" />
      <line x1="70" y1="150" x2="250" y2="150" />
      <path d="M40 260 H280" />
      <path d="M100 150 V60" opacity="0.4" />
      <path d="M220 150 V60" opacity="0.4" />
    </>
  ),
  terrace: (
    <>
      <line x1="30" y1="230" x2="330" y2="230" />
      <line x1="60" y1="230" x2="60" y2="120" />
      <line x1="300" y1="230" x2="300" y2="120" />
      <line x1="60" y1="120" x2="300" y2="120" />
      {[90, 130, 170, 210, 250].map((x) => (
        <line key={x} x1={x} y1="120" x2={x} y2="230" opacity="0.5" />
      ))}
      <circle cx="180" cy="175" r="26" opacity="0.6" />
    </>
  ),
  study: (
    <>
      <rect x="50" y="70" width="260" height="160" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="50" y1={95 + i * 28} x2="310" y2={95 + i * 28} opacity="0.5" />
      ))}
      {[80, 120, 160, 200, 240, 280].map((x) => (
        <line key={x} x1={x} y1="70" x2={x} y2="230" opacity="0.3" />
      ))}
    </>
  ),
  balcony: (
    <>
      <path d="M40 240 H320" />
      <path d="M40 240 V90 H320 V240" opacity="0.5" />
      {[70, 110, 150, 190, 230, 270, 310].map((x) => (
        <line key={x} x1={x} y1="240" x2={x} y2="180" />
      ))}
      <line x1="40" y1="180" x2="320" y2="180" />
      <path d="M90 90 L180 30 L270 90" />
    </>
  ),
  crown: (
    <>
      <path d="M50 220 L110 100 L180 160 L250 90 L310 220 Z" />
      <line x1="30" y1="220" x2="330" y2="220" />
      <circle cx="180" cy="60" r="10" />
      <line x1="180" y1="70" x2="180" y2="30" opacity="0.5" />
    </>
  ),
};

export default function RoomIllustration({ type = "arch", className = "" }) {
  return (
    <svg
      viewBox="0 0 360 280"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      vectorEffect="non-scaling-stroke"
    >
      {variants[type] || variants.arch}
    </svg>
  );
}
