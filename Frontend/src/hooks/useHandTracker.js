import { useCallback, useEffect, useRef, useState } from "react";
import { classify, GestureStabilizer } from "../lib/classifier";
import { aslProbs, features, isConfident, loadAslModel, topOf } from "../lib/asl";
import { pairKey } from "../data/combos";

// Owns the camera + MediaPipe HandLandmarker lifecycle and the per-frame loop:
//   camera frame -> landmarks for up to TWO hands -> recogniser -> stabiliser -> onCommit(...)
// The video never leaves the browser; MediaPipe runs locally via WebAssembly.
//
// Everyday mode: one hand = one sign; two hands = a combination (see data/combos.js).
// ASL mode:      one hand spells letters; the OTHER hand can act as a remote control:
//                open palm = space, thumb down = delete, thumb up = speak.

const ASL_CONTROL = { hello: "space", no: "backspace", fine: "speak" };
const EMA = 0.55; // weight of the newest frame when smoothing ASL probabilities

let landmarkerPromise = null;

async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
      const make = (delegate) =>
        HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: "/models/hand_landmarker.task", delegate },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      try {
        return await make("GPU");
      } catch {
        return await make("CPU"); // older GPUs / some mobile browsers
      }
    })().catch((e) => {
      landmarkerPromise = null; // allow a retry
      throw e;
    });
  }
  return landmarkerPromise;
}

const IDLE_LIVE = { candidate: null, progress: 0, hand: false, hands: 0, guess: null, control: null };

const makeStabilizers = (mode) => ({
  main: new GestureStabilizer(mode === "asl" ? { holdMs: 700, repeatMs: 1700, minAgree: 5 } : {}),
  ctrl: new GestureStabilizer({ holdMs: 900, repeatMs: 2500, minAgree: 5 }),
});

export function useHandTracker({ onCommit, mode = "everyday", leftHanded = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | running | error
  const [error, setError] = useState(null); // "denied" | "missing" | "other"
  const [live, setLive] = useState(IDLE_LIVE);

  const rafRef = useRef(0);
  const streamRef = useRef(null);
  const stab = useRef(makeStabilizers(mode));
  const ema = useRef({}); // per-hand smoothed ASL probabilities
  const capture = useRef(null); // active calibration capture
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const leftRef = useRef(leftHanded);
  leftRef.current = leftHanded;
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const v = videoRef.current;
    if (v) v.srcObject = null;
    const c = canvasRef.current;
    c?.getContext("2d").clearRect(0, 0, c.width, c.height);
    stab.current.main.reset();
    stab.current.ctrl.reset();
    ema.current = {};
    setLive(IDLE_LIVE);
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    setError(null);
    setStatus("loading");
    try {
      const [landmarker, { DrawingUtils, HandLandmarker }] = await Promise.all([
        getLandmarker(),
        import("@mediapipe/tasks-vision"),
        loadAslModel().catch(() => {}),
      ]);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      video.srcObject = stream;
      await video.play();
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      const drawer = new DrawingUtils(ctx);
      const aspect = canvas.width / canvas.height;

      let lastVideoTime = -1;
      let last = null;
      const emit = (next) => {
        // Only re-render when something visible changed.
        const a = last;
        const changed =
          !a ||
          next.candidate !== a.candidate ||
          next.hand !== a.hand ||
          next.hands !== a.hands ||
          next.guess?.letter !== a.guess?.letter ||
          Math.round((next.guess?.conf ?? 0) * 10) !== Math.round((a.guess?.conf ?? 0) * 10) ||
          next.control?.id !== a.control?.id ||
          Math.abs(next.progress - a.progress) > 0.03 ||
          Math.abs((next.control?.progress ?? 0) - (a.control?.progress ?? 0)) > 0.05 ||
          (next.progress === 1) !== (a.progress === 1);
        if (changed) {
          last = next;
          setLive(next);
        }
      };

      const loop = () => {
        rafRef.current = requestAnimationFrame(loop);
        if (video.readyState < 2 || video.currentTime === lastVideoTime) return;
        lastVideoTime = video.currentTime;
        const now = performance.now();

        const result = landmarker.detectForVideo(video, now);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const hands = result.landmarks ?? [];
        const sides = result.handedness ?? result.handednesses ?? [];

        hands.forEach((lm, i) => {
          drawer.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS, { color: i ? "#fcd34d" : "#5eead4", lineWidth: 4 });
          drawer.drawLandmarks(lm, { color: "#ffffff", fillColor: "#0f766e", lineWidth: 1, radius: 4 });
        });

        // ---- calibration capture (any mode, first hand) -----------------------
        const cap = capture.current;
        if (cap && hands[0] && now - cap.lastAt > 90) {
          cap.lastAt = now;
          cap.samples.push(Array.from(features(hands[0], aspect)));
          if (cap.samples.length >= cap.count) {
            cap.resolve(cap.samples);
            capture.current = null;
          }
        }

        const base = { hand: hands.length > 0, hands: hands.length };

        if (modeRef.current === "asl") {
          // Smooth each hand's class probabilities over a few frames.
          const seen = new Set();
          const info = hands.map((lm, i) => {
            let key = sides[i]?.[0]?.categoryName ?? `h${i}`;
            if (seen.has(key)) key += i;
            seen.add(key);
            const raw = aslProbs(lm, aspect);
            let top = null;
            if (raw) {
              const prev = ema.current[key];
              const p = prev && now - prev.t < 400 ? raw.map((v, k) => EMA * v + (1 - EMA) * prev.p[k]) : raw;
              ema.current[key] = { p, t: now };
              top = topOf(p);
            }
            return { rule: classify(lm, aspect), top, x: lm[0].x };
          });
          for (const k of Object.keys(ema.current)) if (!seen.has(k) && now - ema.current[k].t > 400) delete ema.current[k];

          // Roles by position (letters can look like control poses, e.g. A = thumb up).
          // Raw camera x is mirrored on screen, so the SMALLER x is the hand on the screen's right.
          // Right-handed: right hand spells, left hand is the remote. Left-handed: the reverse.
          let letterHand = info[0] ?? null;
          let ctrlHand = null;
          if (info.length >= 2) {
            const [screenRight, screenLeft] = [...info].sort((a, b) => a.x - b.x);
            letterHand = leftRef.current ? screenLeft : screenRight;
            ctrlHand = leftRef.current ? screenRight : screenLeft;
          }
          const letter = letterHand?.top && isConfident(letterHand.top) ? letterHand.top.letter : null;
          const r = stab.current.main.update(letter, now);
          const cr = stab.current.ctrl.update((ctrlHand && ASL_CONTROL[ctrlHand.rule]) || null, now);
          if (r.commit) onCommitRef.current?.({ kind: "letter", id: r.commit });
          if (cr.commit) onCommitRef.current?.({ kind: "control", id: cr.commit });
          emit({
            ...base,
            candidate: r.candidate,
            progress: r.progress,
            guess: letterHand?.top ? { letter: letterHand.top.letter, conf: letterHand.top.conf } : null,
            control: cr.candidate ? { id: cr.candidate, progress: cr.progress } : null,
          });
        } else {
          // Everyday: one sign per hand; two signs together form a combination.
          const ids = hands.map((lm) => classify(lm, aspect)).filter(Boolean);
          let id = null;
          if (ids.includes("emergency")) id = "emergency";
          else if (ids.length >= 2) id = pairKey(ids[0], ids[1]);
          else if (ids.length === 1) id = ids[0];
          const r = stab.current.main.update(id, now);
          if (r.commit) {
            onCommitRef.current?.({ kind: r.commit.includes("+") ? "pair" : "sign", id: r.commit });
          }
          emit({ ...base, candidate: r.candidate, progress: r.progress, guess: null, control: null });
        }
      };
      loop();
      setStatus("running");
    } catch (e) {
      console.error("Camera/tracker error:", e);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError(
        e?.name === "NotAllowedError" || e?.name === "SecurityError"
          ? "denied"
          : e?.name === "NotFoundError" || e?.name === "OverconstrainedError"
            ? "missing"
            : "other",
      );
      setStatus("error");
    }
  }, []);

  /** Record `count` landmark samples from the first visible hand (used by calibration). */
  const captureSamples = useCallback(
    (count = 12) =>
      new Promise((resolve) => {
        capture.current = { count, samples: [], lastAt: 0, resolve };
        setTimeout(() => {
          const c = capture.current;
          if (c) {
            capture.current = null;
            c.resolve(c.samples); // timed out: return what we got
          }
        }, 7000);
      }),
    [],
  );

  // Switching mode swaps the stabilisers (letters need a quicker hold and allow repeats).
  useEffect(() => {
    stab.current = makeStabilizers(mode);
    ema.current = {};
    setLive(IDLE_LIVE);
    if (mode === "asl") loadAslModel().catch(() => {});
  }, [mode]);

  useEffect(() => stop, [stop]); // release the camera on unmount

  return { videoRef, canvasRef, status, error, live, start, stop, captureSamples };
}
