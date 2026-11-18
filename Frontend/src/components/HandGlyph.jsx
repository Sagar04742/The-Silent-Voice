// Schematic hand: shows which digits are extended for a sign.
// pattern = [thumb, index, middle, ring, pinky], 1 = extended.
const FINGER_X = [18.5, 25.5, 32.5, 39.5];
const FINGER_H = [24, 27, 24, 19];

export default function HandGlyph({ pattern = [0, 0, 0, 0, 0], variant, size = 56, className = "" }) {
  const [thumb, ...fingers] = pattern;
  const thumbOnly = thumb && fingers.every((f) => !f);

  return (
    <svg
      width={size} height={size} viewBox="0 0 64 64" className={`glyph ${className}`}
      aria-hidden="true" focusable="false"
      style={variant === "down" ? { transform: "rotate(180deg)" } : undefined}
    >
      {/* fingers */}
      {fingers.map((up, i) => (
        <rect
          key={i} x={FINGER_X[i]} width="6" rx="3"
          y={up ? 38 - FINGER_H[i] : 30} height={up ? FINGER_H[i] : 10}
          className={up ? "g-on" : "g-off"}
        />
      ))}
      {/* palm */}
      <rect x="15" y="32" width="33" height="26" rx="11" className="g-palm" />
      {/* thumb */}
      {thumbOnly ? (
        <path d="M17 44 12 18" strokeWidth="6.5" className="g-on g-stroke" />
      ) : thumb ? (
        <path d="M17 48 6 38" strokeWidth="6.5" className="g-on g-stroke" />
      ) : (
        <path d="M19 47 30 43" strokeWidth="6.5" className="g-off g-stroke" />
      )}
    </svg>
  );
}
