import { useApp } from "../context/AppContext";
import { findGesture } from "../data/gestures";
import { Icon } from "./Icons";

export default function EmergencyOverlay({ onDismiss }) {
  const { t, lang } = useApp();
  const text = findGesture("emergency").text[lang];

  return (
    <div className="emergency" role="alertdialog" aria-label="Emergency" aria-live="assertive">
      <div className="emergency-badge"><Icon name="alert" size={44} strokeWidth={1.6} /></div>
      <h1 lang={lang}>{text}</h1>
      <button className="btn lg light" onClick={onDismiss} autoFocus>{t("dismiss")}</button>
    </div>
  );
}
