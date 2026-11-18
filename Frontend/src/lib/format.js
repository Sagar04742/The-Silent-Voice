const LOCALES = { en: "en-IN", hi: "hi-IN", bn: "bn-IN", ta: "ta-IN" };

export const formatTime = (date, lang) =>
  new Date(date).toLocaleTimeString(LOCALES[lang] || "en-IN", { hour: "numeric", minute: "2-digit" });

export const formatDate = (date, lang) =>
  new Date(date).toLocaleDateString(LOCALES[lang] || "en-IN", { day: "numeric", month: "short", year: "numeric" });

/** "Today" / "Yesterday" / a formatted date, using the given translator. */
export function dayLabel(date, lang, t) {
  const d = new Date(date);
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 86400000);
  if (diff === 0) return t("today");
  if (diff === 1) return t("yesterday");
  return formatDate(d, lang);
}
