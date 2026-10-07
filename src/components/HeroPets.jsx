// A dog and a cat peeking over the top of the price card on the home page.
// Drawn in SVG so it stays sharp at any size and needs no image files.
// The colours are fixed (fur doesn't change in dark mode).
export default function HeroPets() {
  return (
    <svg className="hero-pets" viewBox="0 0 320 132" aria-hidden="true">
      {/* Dog */}
      <g>
        <ellipse cx="62" cy="62" rx="15" ry="30" fill="#7a5638" transform="rotate(14 62 62)" />
        <ellipse cx="138" cy="62" rx="15" ry="30" fill="#7a5638" transform="rotate(-14 138 62)" />
        <path d="M58 132c0-22 16-34 42-34s42 12 42 34z" fill="#b98a5e" />
        <circle cx="100" cy="66" r="42" fill="#b98a5e" />
        <path d="M100 24c16 0 30 9 37 23-9-6-23-8-37-8z" fill="#a67a50" />
        <ellipse cx="100" cy="84" rx="23" ry="18" fill="#f1e0c8" />
        <ellipse cx="100" cy="74" rx="8" ry="5.500" fill="#2b2a22" />
        <path d="M100 79.500v8M100 87.500c-4 5-10 5-13 1M100 87.500c4 5 10 5 13 1" fill="none" stroke="#2b2a22" strokeWidth="2.500" strokeLinecap="round" />
        <circle cx="83" cy="58" r="4.500" fill="#2b2a22" />
        <circle cx="117" cy="58" r="4.500" fill="#2b2a22" />
        <circle cx="84.500" cy="56.500" r="1.400" fill="#fffdf8" />
        <circle cx="118.500" cy="56.500" r="1.400" fill="#fffdf8" />
        <rect x="70" y="118" width="24" height="18" rx="9" fill="#f1e0c8" />
        <rect x="106" y="118" width="24" height="18" rx="9" fill="#f1e0c8" />
      </g>

      {/* Cat */}
      <g>
        <path d="M196 30l6 34h-26z" fill="#d9952a" transform="rotate(-12 196 46)" />
        <path d="M264 30l20 34h-26z" fill="#d9952a" transform="rotate(12 264 46)" />
        <path d="M194 42l3 16h-11z" fill="#f4c9a0" transform="rotate(-12 194 50)" />
        <path d="M265 42l9 16h-11z" fill="#f4c9a0" transform="rotate(12 265 50)" />
        <path d="M194 132c0-18 14-28 36-28s36 10 36 28z" fill="#e5a62e" />
        <ellipse cx="230" cy="78" rx="42" ry="36" fill="#e5a62e" />
        <path d="M221 44l4 14M230 42v16M239 44l-4 14" stroke="#c98a1c" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="230" cy="95" rx="17" ry="12" fill="#fff4de" />
        <path d="M226 87.500h8l-4 4.500z" fill="#c8607a" />
        <path d="M230 92v4M230 96c-3 3.500-7 3.500-9 1M230 96c3 3.500 7 3.500 9 1" fill="none" stroke="#2b2a22" strokeWidth="2.200" strokeLinecap="round" />
        <ellipse cx="213" cy="76" rx="4.500" ry="6" fill="#2b2a22" />
        <ellipse cx="247" cy="76" rx="4.500" ry="6" fill="#2b2a22" />
        <circle cx="214.500" cy="73.500" r="1.400" fill="#fffdf8" />
        <circle cx="248.500" cy="73.500" r="1.400" fill="#fffdf8" />
        <path d="M204 92l-22-4M204 97l-22 3M256 92l22-4M256 97l22 3" stroke="#2b2a22" strokeWidth="1.600" strokeLinecap="round" opacity="0.550" />
        <rect x="206" y="120" width="20" height="16" rx="8" fill="#fff4de" />
        <rect x="234" y="120" width="20" height="16" rx="8" fill="#fff4de" />
      </g>
    </svg>
  )
}
