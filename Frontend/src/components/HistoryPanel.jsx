import { useApp } from "../context/AppContext";
import { findPhrase } from "../data/phrases";
import { findGesture } from "../data/gestures";
import { dayLabel, formatTime } from "../lib/format";
import { Icon } from "./Icons";
import HandGlyph from "./HandGlyph";

function Leading({ id }) {
  const g = findGesture(id);
  if (g) return <span className="h-icon"><HandGlyph pattern={g.pattern} variant={g.variant} size={30} /></span>;
  if (id?.startsWith("pair:")) return <span className="h-icon"><Icon name="hand" size={18} /></span>;
  if (id === "asl") return <span className="h-icon"><Icon name="type" size={18} /></span>;
  return <span className="h-icon"><Icon name="chat" size={18} /></span>;
}

export default function HistoryPanel({ history, onReplay }) {
  const { t, lang } = useApp();
  const { items, remove, clear } = history;

  // Group by calendar day (items are already newest-first).
  const groups = [];
  for (const it of items) {
    const label = dayLabel(it.createdAt, lang, t);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(it);
    else groups.push({ label, items: [it] });
  }

  return (
    <aside className="card history" aria-label={t("history")}>
      <div className="card-head">
        <h2>
          <Icon name="clock" size={17} /> {t("history")} <span className="count">{items.length}</span>
        </h2>
        {items.length > 0 && <button className="btn subtle sm" onClick={clear}>{t("clear")}</button>}
      </div>

      <div className="history-list">
        {items.length === 0 && <p className="empty-note">{t("emptyHistory")}</p>}

        {groups.map((g) => (
          <div key={g.label} className="day">
            <h3>{g.label}</h3>
            <ul>
              {g.items.map((it) => {
                const phrase = findPhrase(it.gestureId);
                const isAsl = it.gestureId === "asl";
                // Known signs/phrases are re-rendered in the CURRENT language.
                const text = phrase ? phrase.text[lang] : it.translation;
                const label = isAsl ? t("spelled") : phrase ? phrase.label[lang] : it.gesture;
                const replay = () =>
                  onReplay(phrase ?? { text: { en: it.translation } }, isAsl || !phrase ? "en" : undefined);
                return (
                  <li key={it.id} className="h-item">
                    <button className="h-main" onClick={replay} title={t("replay")}>
                      <Leading id={it.gestureId} />
                      <span className="h-body">
                        {/* Phrases have no separate title, so show their text once. */}
                        {label === text ? (
                          <span className="h-label clamp" lang={lang}>{text}</span>
                        ) : (
                          <>
                            <span className="h-label" lang={lang}>{label}</span>
                            <span className="h-text" lang={isAsl ? "en" : lang}>{text}</span>
                          </>
                        )}
                      </span>
                      <time className="h-time">{formatTime(it.createdAt, lang)}</time>
                    </button>
                    <button className="h-del" onClick={() => remove(it.id)} aria-label={t("delete")} title={t("delete")}>
                      <Icon name="x" size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
