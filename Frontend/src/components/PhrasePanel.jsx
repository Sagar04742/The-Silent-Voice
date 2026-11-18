import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES, BUILDER, buildSentence } from "../data/phrases";
import { Icon } from "./Icons";

const LANGS = ["en", "hi", "bn", "ta"];
const KIND_ORDER = ["thing", "person", "place"];

export default function PhrasePanel({ onPick }) {
  const { t, lang } = useApp();
  const [tab, setTab] = useState(CATEGORIES[0].id);
  const [tpl, setTpl] = useState(BUILDER.templates[0].id);

  const category = CATEGORIES.find((c) => c.id === tab);
  const template = BUILDER.templates.find((x) => x.id === tpl);
  const items = BUILDER.items
    .filter((i) => template.kinds.includes(i.kind))
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));

  return (
    <section className="card phrases" aria-label={t("phrases")}>
      <div className="card-head">
        <h2><Icon name="chat" size={17} /> {t("phrases")}</h2>
      </div>

      <div className="tabs" role="tablist">
        {CATEGORIES.map((c) => (
          <button key={c.id} role="tab" aria-selected={tab === c.id} className={tab === c.id ? "on" : ""} onClick={() => setTab(c.id)} lang={lang}>
            {c.name[lang]}
          </button>
        ))}
        <button role="tab" aria-selected={tab === "builder"} className={`${tab === "builder" ? "on" : ""} accent`} onClick={() => setTab("builder")} lang={lang}>
          <Icon name="sparkle" size={14} /> {t("builder")}
        </button>
      </div>

      {tab !== "builder" ? (
        <div className="phrase-grid" role="tabpanel">
          {category.phrases.map((p) => (
            <button key={p.id} className="phrase" lang={lang} onClick={() => onPick(p)}>
              <span>{p.text[lang]}</span>
              <Icon name="play" size={13} />
            </button>
          ))}
        </div>
      ) : (
        <div className="builder" role="tabpanel">
          <p className="hint">{t("builderHint")}</p>
          <div className="seg-row">
            {BUILDER.templates.map((x) => (
              <button key={x.id} className={`seg-btn ${tpl === x.id ? "on" : ""}`} onClick={() => setTpl(x.id)} lang={lang}>
                {x.label[lang]}
              </button>
            ))}
          </div>
          <div className="chips">
            {items.map((i) => (
              <button
                key={i.id} className="chip lg" lang={lang}
                onClick={() => {
                  const text = Object.fromEntries(LANGS.map((l) => [l, buildSentence(tpl, i.id, l)]));
                  onPick({ id: `build:${tpl}:${i.id}`, label: text, text });
                }}
              >
                {i[lang] ?? i.en}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
