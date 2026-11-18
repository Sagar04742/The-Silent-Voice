import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { GESTURES, findGesture } from "../data/gestures";
import { COMBOS } from "../data/combos";
import { Icon } from "./Icons";
import HandGlyph from "./HandGlyph";

const FINGER_NAMES = ["Thumb", "Index", "Middle", "Ring", "Pinky"];

// How each ASL letter is formed (what the recogniser was trained on).
export const ASL_HINTS = {
  A: "Fist, thumb resting along the side",
  B: "Flat hand, fingers together, thumb across the palm",
  C: "Curve the whole hand into a C",
  D: "Index up, other fingertips touch the thumb",
  E: "Fingertips curled down onto the thumb",
  F: "Thumb and index touch, other three fingers up",
  G: "Index and thumb point sideways, parallel",
  H: "Index and middle point sideways, together",
  I: "Fist with the pinky up",
  K: "Index and middle up in a V, thumb between them",
  L: "Thumb and index make an L",
  M: "Thumb tucked under three fingers",
  N: "Thumb tucked under two fingers",
  O: "All fingertips meet the thumb in an O",
  P: "Like K, pointing down",
  Q: "Like G, pointing down",
  R: "Index and middle fingers crossed",
  S: "Fist with the thumb across the front",
  T: "Fist, thumb between index and middle",
  U: "Index and middle up, together",
  V: "Index and middle up, apart",
  W: "Index, middle and ring up, apart",
  X: "Index finger hooked",
  Y: "Thumb and pinky out",
};

function EverydayGuide({ onSpeak }) {
  const { lang } = useApp();
  return (
    <div className="guide-grid">
      {GESTURES.map((g) => (
        <button key={g.id} className={`guide-card ${g.emergency ? "danger" : ""}`} onClick={() => onSpeak(g)}>
          <HandGlyph pattern={g.pattern} variant={g.variant} size={64} />
          <strong lang={lang}>{g.label[lang]}</strong>
          <small lang="en">{g.how}</small>
        </button>
      ))}
    </div>
  );
}

function TwoHandGuide() {
  const { t, lang } = useApp();
  return (
    <>
      <p className="hint">{t("pairHint")}</p>
      <div className="combo-list">
        {COMBOS.map((c) => {
          const ga = findGesture(c.a);
          const gb = findGesture(c.b);
          return (
            <div key={c.key} className="combo">
              <span className="glyph-pair">
                <HandGlyph pattern={ga.pattern} variant={ga.variant} size={34} />
                <HandGlyph pattern={gb.pattern} variant={gb.variant} size={34} />
              </span>
              <span className="combo-body">
                <small lang={lang}>{ga.label[lang]} + {gb.label[lang]}</small>
                <strong lang={lang}>{c.text[lang]}</strong>
              </span>
            </div>
          );
        })}
      </div>
      <p className="hint">{t("ctrlHint")}</p>
    </>
  );
}

function AslGuide({ letters }) {
  const { t } = useApp();
  return (
    <>
      <div className="asl-grid">
        {letters.map((l) => (
          <div key={l} className="asl-card">
            <span className="asl-letter">{l}</span>
            <small lang="en">{ASL_HINTS[l]}</small>
          </div>
        ))}
      </div>
      <p className="hint">{t("noSupport")}</p>
    </>
  );
}

export default function GuideModal({ onClose, onSpeak, initialTab = "everyday", letters }) {
  const { t } = useApp();
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={t("signGuide")} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{t("signGuide")}</h2>
            <p className="muted">{t("signGuideHint")}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={t("close")}><Icon name="x" /></button>
        </div>

        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "everyday"} className={tab === "everyday" ? "on" : ""} onClick={() => setTab("everyday")}>{t("modeEveryday")}</button>
          <button role="tab" aria-selected={tab === "asl"} className={tab === "asl" ? "on" : ""} onClick={() => setTab("asl")}>{t("modeAsl")}</button>
          <button role="tab" aria-selected={tab === "two"} className={tab === "two" ? "on" : ""} onClick={() => setTab("two")}>{t("twoHands")}</button>
        </div>

        {tab === "everyday" ? (
          <>
            <EverydayGuide onSpeak={onSpeak} />
            <p className="hint legend">
              {FINGER_NAMES.join(" · ")}: <span className="legend-on" /> up <span className="legend-off" /> down
            </p>
          </>
        ) : tab === "asl" ? (
          <AslGuide letters={letters} />
        ) : (
          <TwoHandGuide />
        )}
      </div>
    </div>
  );
}
