import { LANGUAGES } from "../data/gestures";

// Text-to-speech via the browser's built-in Web Speech API (free, offline-capable,
// nothing is sent to a server). Voices load asynchronously, so we cache them.

let voices = [];
const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

function loadVoices() {
  if (synth) voices = synth.getVoices();
}
if (synth) {
  loadVoices();
  synth.addEventListener?.("voiceschanged", loadVoices);
}

const norm = (s) => s.replace("_", "-").toLowerCase();

export function findVoice(langCode) {
  const cfg = LANGUAGES.find((l) => l.code === langCode);
  if (!cfg) return null;
  for (const want of cfg.speech) {
    const exact = voices.find((v) => norm(v.lang) === norm(want));
    if (exact) return exact;
  }
  // Fall back to any voice for the base language (e.g. "bn-*").
  return voices.find((v) => norm(v.lang).split("-")[0] === langCode) || null;
}

export const hasVoice = (langCode) => !synth || voices.length === 0 || Boolean(findVoice(langCode));

export function speak(text, langCode, { rate = 0.95 } = {}) {
  if (!synth || !text) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = findVoice(langCode);
  const cfg = LANGUAGES.find((l) => l.code === langCode);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || cfg?.speech[0] || "en-US";
  u.rate = rate;
  synth.speak(u);
}

export function stopSpeaking() {
  synth?.cancel();
}

// ---- Emergency siren (Web Audio, no asset needed) --------------------------
let siren = null;

export function startSiren() {
  if (siren) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  gain.gain.value = 0.18;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  let high = false;
  const timer = setInterval(() => {
    high = !high;
    osc.frequency.setValueAtTime(high ? 880 : 620, ctx.currentTime);
  }, 450);
  osc.frequency.value = 620;
  siren = { ctx, osc, timer };
}

export function stopSiren() {
  if (!siren) return;
  clearInterval(siren.timer);
  try {
    siren.osc.stop();
    siren.ctx.close();
  } catch {
    /* already stopped */
  }
  siren = null;
}
