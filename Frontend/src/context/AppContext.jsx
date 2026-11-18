import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STRINGS } from "../data/strings";
import { LANGUAGES } from "../data/gestures";
import { api, getToken, setToken } from "../lib/api";
import { stopSpeaking } from "../lib/speech";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const read = (k, fallback) => {
  try {
    return localStorage.getItem(k) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage unavailable */
  }
};

export function AppProvider({ children }) {
  // ---- preferences -------------------------------------------------------
  const [lang, setLangState] = useState(() => {
    const saved = read("sv_lang", "en");
    return LANGUAGES.some((l) => l.code === saved) ? saved : "en";
  });
  const [theme, setThemeState] = useState(() =>
    read("sv_theme", window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );
  const [muted, setMutedState] = useState(() => read("sv_muted", "0") === "1");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = lang;
  }, [theme, lang]);

  const setLang = (l) => (setLangState(l), write("sv_lang", l));
  const toggleTheme = () => {
    const t = theme === "dark" ? "light" : "dark";
    setThemeState(t);
    write("sv_theme", t);
  };
  const toggleMuted = () => {
    const m = !muted;
    setMutedState(m);
    write("sv_muted", m ? "1" : "0");
    if (m) stopSpeaking();
  };

  const t = useCallback((key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key, [lang]);

  // ---- auth ----------------------------------------------------------------
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch((e) => {
        if (e.status === 401) setToken(null); // expired token
      })
      .finally(() => setAuthReady(true));
  }, []);

  const finishAuth = useCallback((data) => {
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, theme, toggleTheme, muted, toggleMuted, t, user, authReady, finishAuth, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, theme, muted, t, user, authReady, finishAuth, logout],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
