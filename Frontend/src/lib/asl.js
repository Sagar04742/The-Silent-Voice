// ---------------------------------------------------------------------------
// ASL fingerspelling recogniser (static letters A-Y, without J and Z).
//
// 1. A small neural network (63 -> 192 -> 96 -> 24) trained on ~10k hand poses from
//    three public datasets (single-signer photos + multi-signer webcam landmarks).
//    It never sees pixels: MediaPipe turns the image into 21 landmarks first.
// 2. Optional PERSONAL CALIBRATION: poses the user recorded themselves. A letter
//    whose recorded poses closely match the current hand is boosted, which adapts
//    the model to one person's signing style without any retraining.
// 3. Temporal smoothing (probabilities averaged over a few frames) is done by the caller.
// ---------------------------------------------------------------------------

let model = null;
let loading = null;
let personal = []; // [{ letter, x: Float32Array(63) }]

export function loadAslModel() {
  if (model) return Promise.resolve(model);
  loading ??= fetch("/models/asl_mlp.json")
    .then((r) => r.json())
    .then((m) => (model = m));
  return loading;
}

export const aslLabels = () => model?.labels ?? [];

/** Landmarks -> 63 numbers, translated to the wrist and scaled by palm size. */
export function features(landmarks, aspect = 4 / 3) {
  const pts = landmarks.map((p) => [p.x * aspect, p.y, p.z * aspect]);
  const [wx, wy, wz] = pts[0];
  const scale = Math.hypot(pts[9][0] - wx, pts[9][1] - wy) || 1e-6;
  const out = new Float32Array(63);
  for (let i = 0; i < 21; i++) {
    out[i * 3] = (pts[i][0] - wx) / scale;
    out[i * 3 + 1] = (pts[i][1] - wy) / scale;
    out[i * 3 + 2] = (pts[i][2] - wz) / scale;
  }
  return out;
}

function forward(x) {
  let a = x;
  const last = model.layers.length - 1;
  model.layers.forEach((L, li) => {
    const out = new Float32Array(L.b.length);
    for (let j = 0; j < out.length; j++) {
      let s = L.b[j];
      for (let i = 0; i < a.length; i++) s += a[i] * L.W[i][j];
      out[j] = li < last && s < 0 ? 0 : s; // ReLU on hidden layers
    }
    a = out;
  });
  const max = Math.max(...a);
  const e = Array.from(a, (v) => Math.exp(v - max));
  const sum = e.reduce((p, c) => p + c, 0);
  return e.map((v) => v / sum);
}

// ---- Personal calibration ----------------------------------------------------
export const setPersonalSamples = (samples) => {
  personal = samples.map((s) => ({ letter: s.letter, x: Float32Array.from(s.x) }));
};
export const personalCounts = () => {
  const c = {};
  for (const s of personal) c[s.letter] = (c[s.letter] || 0) + 1;
  return c;
};

function boost(probs, x) {
  if (!personal.length) return probs;
  const best = {};
  for (const s of personal) {
    let d = 0;
    for (let i = 0; i < 63; i++) {
      const diff = s.x[i] - x[i];
      d += diff * diff;
    }
    d = Math.sqrt(d);
    if (best[s.letter] === undefined || d < best[s.letter]) best[s.letter] = d;
  }
  const out = probs.map((p, i) => {
    const d = best[model.labels[i]];
    return d === undefined ? p : p * (1 + 3 * Math.exp(-((d / 0.8) ** 2)));
  });
  const sum = out.reduce((p, c) => p + c, 0);
  return out.map((v) => v / sum);
}

/** Class probabilities (aligned with aslLabels()) for one hand, or null if the model isn't loaded. */
export function aslProbs(landmarks, aspect = 4 / 3) {
  if (!model) return null;
  const x = features(landmarks, aspect);
  return boost(forward(x), x);
}

/** Best letter + confidence + margin over the runner-up. */
export function topOf(probs) {
  let b = 0;
  let s = -1;
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > probs[b]) {
      s = b;
      b = i;
    } else if (s < 0 || probs[i] > probs[s]) s = i;
  }
  if (s < 0) s = b === 0 ? 1 : 0;
  return { letter: model.labels[b], conf: probs[b], margin: probs[b] - probs[s] };
}

/** Accept a prediction only when it is both confident and clearly ahead of the runner-up. */
export const isConfident = (t) => t.conf >= 0.55 && t.margin >= 0.15;
