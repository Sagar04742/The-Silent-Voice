import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "./Icons";

const LETTERS = "ABCDEFGHIKLMNOPQRSTUVWXY".split("");

// Lets the user record their own hand poses for each letter. The recogniser then favours
// letters whose recorded poses match the live hand: it adapts to one person's signing style.
export default function CalibratePanel({ tracker, samples, onAdd, onReset, onClose }) {
  const { t } = useApp();
  const [letter, setLetter] = useState("A");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState("");

  const counts = {};
  for (const s of samples) counts[s.letter] = (counts[s.letter] || 0) + 1;
  const ready = tracker.status === "running";

  const record = async () => {
    setBusy(true);
    setFlash("");
    const got = await tracker.captureSamples(12);
    setBusy(false);
    if (got.length) {
      onAdd(got.map((x) => ({ letter, x })));
      setFlash(`${letter}: +${got.length}`);
    }
  };

  return (
    <section className="card calibrate" aria-label={t("calibrateTitle")}>
      <div className="card-head">
        <h2><Icon name="sparkle" size={17} /> {t("calibrateTitle")}</h2>
        <button className="icon-btn" onClick={onClose} aria-label={t("close")}><Icon name="x" /></button>
      </div>
      <p className="hint pad">{t("calibrateHint")}</p>

      <div className="letter-grid" role="listbox" aria-label="Letters">
        {LETTERS.map((l) => (
          <button key={l} role="option" aria-selected={letter === l} className={`letter-btn ${letter === l ? "on" : ""}`} onClick={() => setLetter(l)}>
            {l}
            {counts[l] > 0 && <small>{counts[l]}</small>}
          </button>
        ))}
      </div>

      <div className="actions">
        <button className="btn primary" onClick={record} disabled={busy || !ready}>
          <Icon name="camera" /> {busy ? t("recording") : `${t("record")} ${letter}`}
        </button>
        {samples.length > 0 && (
          <button className="btn subtle" onClick={onReset}><Icon name="trash" /> {t("resetPersonal")}</button>
        )}
        <span className="grow" />
        <span className="meta">{samples.length} {t("samples")}{flash && <b className="flash"> {flash}</b>}</span>
      </div>
      {!ready && <p className="notice"><Icon name="alert" size={15} /> {t("needCamera")}</p>}
    </section>
  );
}
