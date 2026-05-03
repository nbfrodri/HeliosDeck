export function BrandGlyph({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <radialGradient id="bg-sun" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#fff3d9" />
          <stop offset="60%" stopColor="#ffb377" />
          <stop offset="100%" stopColor="#ff7a3d" />
        </radialGradient>
        <linearGradient id="bg-orbit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>
      {/* orbit ring */}
      <ellipse
        cx="16" cy="16" rx="14" ry="6.5"
        fill="none"
        stroke="url(#bg-orbit)"
        strokeWidth="1"
        transform="rotate(-22 16 16)"
      />
      {/* sun */}
      <circle cx="16" cy="16" r="6" fill="url(#bg-sun)" />
      <circle cx="16" cy="16" r="6" fill="none" stroke="rgba(255,255,255,0.25)" />
      {/* moon on orbit */}
      <g transform="rotate(-22 16 16)">
        <circle cx="29" cy="16" r="2.6" fill="#e7eaf5" />
        <circle cx="29.8" cy="16" r="2.2" fill="#1c2456" />
      </g>
      {/* tiny star */}
      <circle cx="3.5" cy="8" r="0.8" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function Brand() {
  return (
    <div className="brand">
      <BrandGlyph size={26} />
      <span className="brand__word">
        <span className="brand__h">Helios</span>
        <span className="brand__d">Deck</span>
      </span>
    </div>
  );
}
