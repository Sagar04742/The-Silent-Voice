// Minimal stroke icon set (24px grid). Inline SVG: no dependency, inherits currentColor.
const PATHS = {
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3.2" /></>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2.5" />,
  volume: <><path d="M11 5 6 9H2.5v6H6l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>,
  volumeOff: <><path d="M11 5 6 9H2.5v6H6l5 4V5z" /><path d="m22 9-6 6M16 9l6 6" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  trash: <path d="M4 7h16M9 7V4.5h6V7M18 7l-.8 12.5a1 1 0 0 1-1 .9H7.8a1 1 0 0 1-1-.9L6 7M10 11v6M14 11v6" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></>,
  logout: <path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9M16 17l5-5-5-5M21 12H9" />,
  book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />,
  backspace: <path d="M21 5H8.5L2 12l6.5 7H21a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM17 9.5l-5 5M12 9.5l5 5" />,
  space: <path d="M3 10v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5" />,
  play: <path d="M7 4.5v15l12-7.5-12-7.5z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L3.5 20.5l1.4-4.9A8 8 0 1 1 21 12z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
  type: <path d="M4 7V5h16v2M12 5v14M9 19h6" />,
  hand: <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-6.5v-2a1.5 1.5 0 0 1 3 0V12m0-7a1.5 1.5 0 0 1 3 0v8m0-5a1.5 1.5 0 0 1 3 0v7.5A7.5 7.5 0 0 1 12.5 22h-1a7 7 0 0 1-5.6-2.8L3.3 14.5a1.7 1.7 0 0 1 2.6-2.1L8 14.5" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />,
  shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.9 7.5-9.5V6L12 3zM9 12l2.2 2.2L15.5 10" />,
};

export function Icon({ name, size = 18, className = "", ...rest }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={`icon ${className}`} aria-hidden="true" focusable="false" {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

// Brand mark: a rounded tile containing a voice waveform.
export function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="var(--accent)" />
      <g fill="var(--accent-ink)">
        <rect x="9" y="16" width="3.4" height="8" rx="1.7" />
        <rect x="15" y="11" width="3.4" height="18" rx="1.7" />
        <rect x="21" y="8" width="3.4" height="24" rx="1.7" />
        <rect x="27" y="13" width="3.4" height="14" rx="1.7" />
      </g>
    </svg>
  );
}
