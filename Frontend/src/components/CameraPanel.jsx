import { useApp } from "../context/AppContext";
import { findGesture } from "../data/gestures";
import { resolvePair } from "../data/combos";
import { Icon } from "./Icons";
import HandGlyph from "./HandGlyph";

const CONTROL_LABEL = { space: "ctrlSpace", backspace: "ctrlBackspace", speak: "ctrlSpeak" };

function Detection({ live, mode }) {
  const { t, lang } = useApp();
  const holding = live.progress < 1;
  const cand = live.candidate;

  // ---- ASL letter ---------------------------------------------------------
  if (mode === "asl") {
    if (cand) {
      return (
        <div className={`detect ${!holding ? "done" : ""}`}>
          <span className="detect-letter">{cand}</span>
          <div className="detect-body">
            <strong>{t("modeAsl")} · {cand}</strong>
            <small>{holding ? t("holdHint") : t("detected")}</small>
          </div>
          <div className="bar"><div style={{ width: `${Math.round(live.progress * 100)}%` }} /></div>
        </div>
      );
    }
    return (
      <div className="detect idle">
        {live.guess ? (
          <>
            <span className="detect-letter dim">{live.guess.letter}</span>
            <div className="detect-body">
              <strong>{t("bestGuess")}: {live.guess.letter} · {Math.round(live.guess.conf * 100)}%</strong>
              <small>{t("holdHint")}</small>
            </div>
          </>
        ) : (
          <div className="detect-body"><strong>{t("noHand")}</strong></div>
        )}
      </div>
    );
  }

  // ---- Everyday sign or two-hand combination -----------------------------------
  if (cand) {
    const parts = cand.split("+");
    const gs = parts.map(findGesture).filter(Boolean);
    const label = parts.length === 2 ? resolvePair(parts[0], parts[1]).label[lang] : gs[0]?.label[lang];
    return (
      <div className={`detect ${!holding ? "done" : ""}`}>
        <span className="glyph-pair">
          {gs.map((g, i) => <HandGlyph key={i} pattern={g.pattern} variant={g.variant} size={38} />)}
        </span>
        <div className="detect-body">
          <strong lang={lang}>{label}</strong>
          <small>{holding ? t("holdHint") : t("detected")}</small>
        </div>
        <div className="bar"><div style={{ width: `${Math.round(live.progress * 100)}%` }} /></div>
      </div>
    );
  }
  return (
    <div className="detect idle">
      <div className="detect-body"><strong>{live.hand ? t("holdHint") : t("noHand")}</strong></div>
    </div>
  );
}

export default function CameraPanel({ tracker, mode }) {
  const { t } = useApp();
  const { videoRef, canvasRef, status, error, live, start, stop } = tracker;

  return (
    <section className="card camera" aria-label={t("liveCamera")}>
      <div className="card-head">
        <h2>
          <span className={`dot ${status === "running" ? "live" : ""}`} aria-hidden="true" /> {t("liveCamera")}
          {status === "running" && live.hands > 0 && (
            <span className="tag hands">{live.hands === 2 ? t("twoHands") : "1"}</span>
          )}
        </h2>
        {status === "running" && (
          <button className="btn subtle sm" onClick={stop}><Icon name="stop" size={14} /> {t("stopCamera")}</button>
        )}
      </div>

      <div className="viewport">
        {/* Mirrored like a selfie so left/right feel natural. */}
        <video ref={videoRef} playsInline muted className={status === "running" ? "" : "hidden"} />
        <canvas ref={canvasRef} className={status === "running" ? "" : "hidden"} />

        {status === "idle" && (
          <div className="stage">
            <div className="stage-icon"><Icon name="camera" size={26} /></div>
            <p>{t("startHint")}</p>
            <button className="btn primary lg" onClick={start}><Icon name="camera" /> {t("startCamera")}</button>
            <small><Icon name="shield" size={14} /> {t("privacy")}</small>
          </div>
        )}

        {status === "loading" && (
          <div className="stage" role="status">
            <div className="spinner" aria-hidden="true" />
            <p>{t("loading")}</p>
          </div>
        )}

        {status === "error" && (
          <div className="stage" role="alert">
            <div className="stage-icon warn"><Icon name="alert" size={26} /></div>
            <strong>{t("camError")}</strong>
            <p>{error === "denied" ? t("camDenied") : error === "missing" ? t("camMissing") : t("camError")}</p>
            <button className="btn primary" onClick={start}>{t("startCamera")}</button>
          </div>
        )}

        {status === "running" && (
          <>
            {live.control && (
              <div className="ctrl-badge" aria-live="polite">
                <Icon name="hand" size={15} /> {t(CONTROL_LABEL[live.control.id])}
                <div className="bar"><div style={{ width: `${Math.round(live.control.progress * 100)}%` }} /></div>
              </div>
            )}
            <div className="hud" aria-live="polite"><Detection live={live} mode={mode} /></div>
          </>
        )}
      </div>
    </section>
  );
}
