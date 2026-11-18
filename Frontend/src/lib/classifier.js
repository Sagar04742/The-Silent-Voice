// ---------------------------------------------------------------------------
// Rule-based hand-sign classifier.
//
// Input: the 21 MediaPipe hand landmarks (normalised 0..1) of ONE hand.
// Output: a sign id ("hello", "yes", ...) or null when nothing matches.
//
// Why rules and not a trained model? 14 static signs are fully described by
// "which fingers are extended" + a couple of geometric checks, it needs no
// training data, runs in microseconds, and every decision is explainable.
//
// Everything is measured relative to the wrist, so it works at any distance,
// for left or right hands, and when the hand is rotated.
// ---------------------------------------------------------------------------

// Landmark indices (MediaPipe Hands)
const WRIST = 0;
const THUMB = { cmc: 1, mcp: 2, ip: 3, tip: 4 };
const FINGERS = [
  { mcp: 5, pip: 6, tip: 8 }, // index
  { mcp: 9, pip: 10, tip: 12 }, // middle
  { mcp: 13, pip: 14, tip: 16 }, // ring
  { mcp: 17, pip: 18, tip: 20 }, // pinky
];

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Which of the five digits are extended? Returns [thumb, index, middle, ring, pinky]. */
export function fingerStates(pts) {
  const palm = dist(pts[WRIST], pts[9]); // wrist -> middle knuckle = hand-size yardstick

  const fingers = FINGERS.map(({ mcp, pip, tip }) => {
    const tipD = dist(pts[WRIST], pts[tip]);
    // Extended finger: tip is clearly farther from the wrist than its own knuckles.
    return tipD > dist(pts[WRIST], pts[pip]) * 1.05 && tipD > dist(pts[WRIST], pts[mcp]) * 1.5;
  });

  // The thumb bends sideways, so compare against the far side of the palm instead.
  const thumb = dist(pts[THUMB.tip], pts[17]) > palm * 1.0 && dist(pts[THUMB.tip], pts[THUMB.mcp]) > palm * 0.45;

  return [thumb, ...fingers].map(Number);
}

/**
 * @param {{x:number,y:number}[]} landmarks  21 normalised landmarks
 * @param {number} aspect                    video width / height (to undo non-square normalisation)
 */
export function classify(landmarks, aspect = 4 / 3) {
  if (!landmarks || landmarks.length < 21) return null;
  const pts = landmarks.map((p) => ({ x: p.x * aspect, y: p.y }));
  const palm = dist(pts[WRIST], pts[9]);
  if (palm < 0.02) return null; // hand too small / far away to judge

  const [thumb, index, middle, ring, pinky] = fingerStates(pts);
  const key = `${thumb}${index}${middle}${ring}${pinky}`;

  // OK sign: thumb tip touching index tip while the other three stand up.
  if (dist(pts[THUMB.tip], pts[8]) < palm * 0.35 && middle && ring && pinky) return "thanks";

  switch (key) {
    case "11111":
      return "hello";
    case "00000":
      return "yes";
    case "01111":
      return "wait";
    case "01000":
      return "water";
    case "01100":
      return "food";
    case "01110":
      return "washroom";
    case "11000":
      return "help";
    case "11001":
      return "love";
    case "01001":
      return "doctor";
    case "10001":
      return "call";
    case "11100":
      return "emergency";
    case "00001":
      return "sorry";
    case "11110":
      return "please";
    case "10000": {
      // Thumb alone: up = fine, down = no. Sideways thumbs are ignored to avoid accidents.
      const dx = pts[THUMB.tip].x - pts[THUMB.mcp].x;
      const dy = pts[THUMB.tip].y - pts[THUMB.mcp].y;
      if (Math.abs(dy) < Math.abs(dx) * 0.8) return null;
      return dy < 0 ? "fine" : "no";
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Stabiliser: a sign only counts after being held steady. This is what stops
// flickering frames and half-formed hands from speaking nonsense.
// ---------------------------------------------------------------------------
export class GestureStabilizer {
  constructor({ holdMs = 900, emergencyMs = 1400, windowSize = 8, minAgree = 6, repeatMs = 6000 } = {}) {
    Object.assign(this, { holdMs, emergencyMs, windowSize, minAgree, repeatMs });
    this.reset();
  }

  reset() {
    this.buffer = [];
    this.candidate = null;
    this.since = 0;
    this.lastCommit = null;
    this.lastCommitAt = 0;
  }

  /** Feed one frame's raw prediction. Returns { candidate, progress, commit }. */
  update(id, now = performance.now()) {
    this.buffer.push(id);
    if (this.buffer.length > this.windowSize) this.buffer.shift();

    // Majority vote over the recent frames.
    const counts = new Map();
    for (const g of this.buffer) if (g) counts.set(g, (counts.get(g) || 0) + 1);
    let winner = null;
    let best = 0;
    for (const [g, c] of counts) if (c > best) [winner, best] = [g, c];
    const candidate = best >= this.minAgree ? winner : null;

    if (candidate !== this.candidate) {
      this.candidate = candidate;
      this.since = now;
      this.lastCommit = null; // a different sign (or a pause) re-arms repeating
    }

    if (!candidate) return { candidate: null, progress: 0, commit: null };

    const need = candidate === "emergency" ? this.emergencyMs : this.holdMs;
    const progress = Math.min(1, (now - this.since) / need);
    let commit = null;
    if (progress >= 1) {
      const repeatOk = now - this.lastCommitAt > this.repeatMs;
      if (this.lastCommit !== candidate || repeatOk) {
        commit = candidate;
        this.lastCommit = candidate;
        this.lastCommitAt = now;
      }
    }
    return { candidate, progress, commit };
  }

  /** Call when no hand is visible. */
  noHand(now = performance.now()) {
    return this.update(null, now);
  }
}
