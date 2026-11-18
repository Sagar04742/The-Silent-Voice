import { useApp } from "../context/AppContext";
import { LANGUAGES } from "../data/gestures";
import { findPhrase } from "../data/phrases";
import { suggest } from "../data/words";
import { hasVoice } from "../lib/speech";
import { formatTime } from "../lib/format";
import { Icon } from "./Icons";

function Message({ current, onReplay }) {
  const { t, lang } = useApp();
  const phrase = current ? findPhrase(current.id) : null;
  const langName = LANGUAGES.find((l) => l.code === lang)?.native;

  return (
    <section className="card output" aria-live="polite" aria-atomic="true">
      <div className="card-head">
        <h2>{t("translation")}</h2>
        {phrase && (
          <span className="meta">
            <span className="tag">{langName}</span> {formatTime(current.at, lang)}
          </span>
        )}
      </div>
      {phrase ? (
        <>
          <p className="output-text" lang={lang} key={current.at}>{phrase.text[lang]}</p>
          <div className="actions">
            <button className="btn secondary" onClick={() => onReplay(phrase)}>
              <Icon name="volume" /> {t("replay")}
            </button>
          </div>
        </>
      ) : (
        <p className="output-text placeholder" lang={lang}>{t("waiting")}</p>
      )}
      <p className="hint">{t("pairHint")}</p>
      {!hasVoice(lang) && (
        <p className="notice"><Icon name="alert" size={15} /> {t("noVoice")}</p>
      )}
    </section>
  );
}

function Composer({ text, setText, onSpeak, live, onCalibrate, leftHanded, onToggleLeft }) {
  const { t } = useApp();
  const suggestions = suggest(text);
  const candidate = live.candidate;

  const complete = (word) => {
    const parts = text.split(" ");
    parts[parts.length - 1] = word;
    setText(parts.join(" ") + " ");
  };

  return (
    <section className="card output" aria-live="polite">
      <div className="card-head">
        <h2>{t("modeAsl")}</h2>
        <span className="meta">{t("aslEnglishOnly")}</span>
      </div>

      <div className={`composer ${text ? "" : "placeholder"}`} lang="en">
        <span>{text || t("composerEmpty")}</span>
        <i className="caret" aria-hidden="true" />
        {candidate && live.progress < 1 && <span className="ghost-letter" aria-hidden="true">{candidate}</span>}
      </div>

      {suggestions.length > 0 && (
        <div className="suggest" aria-label={t("suggestions")}>
          {suggestions.map((w) => (
            <button key={w} className="chip" onClick={() => complete(w)}>{w}</button>
          ))}
        </div>
      )}

      <div className="actions">
        <button className="btn secondary" onClick={() => setText(text + " ")} disabled={!text || text.endsWith(" ")}>
          <Icon name="space" /> {t("space")}
        </button>
        <button className="btn secondary" onClick={() => setText(text.slice(0, -1))} disabled={!text}>
          <Icon name="backspace" /> {t("backspace")}
        </button>
        <button className="btn subtle" onClick={() => setText("")} disabled={!text}>
          <Icon name="trash" /> {t("clearText")}
        </button>
        <button className="btn subtle" onClick={onCalibrate}>
          <Icon name="sparkle" /> {t("calibrate")}
        </button>
        <button className={`btn subtle ${leftHanded ? "toggled" : ""}`} onClick={onToggleLeft} aria-pressed={leftHanded}>
          <Icon name="hand" /> {t("leftHanded")}
        </button>
        <span className="grow" />
        <button className="btn primary" onClick={onSpeak} disabled={!text.trim()}>
          <Icon name="volume" /> {t("speakText")}
        </button>
      </div>
      <p className="hint">{t("aslHint")}</p>
      <p className="hint tight">{t("ctrlHint")}</p>
    </section>
  );
}

export default function OutputPanel({ mode, ...props }) {
  return mode === "asl" ? <Composer {...props} /> : <Message {...props} />;
}
