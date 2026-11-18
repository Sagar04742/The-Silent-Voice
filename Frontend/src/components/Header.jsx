import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LANGUAGES } from "../data/gestures";
import { Icon, Logo } from "./Icons";

function LanguageMenu() {
  const { lang, setLang, t } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === lang);

  useEffect(() => {
    if (!open) return;
    const close = (e) => (!ref.current?.contains(e.target) || e.type === "keydown") && setOpen(false);
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button className="btn subtle" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open} aria-label={t("language")}>
        <Icon name="globe" size={16} /> <span lang={lang}>{current.native}</span> <Icon name="chevron" size={14} />
      </button>
      {open && (
        <ul className="menu-pop" role="listbox" aria-label={t("language")}>
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button role="option" aria-selected={l.code === lang} className={l.code === lang ? "on" : ""}
                onClick={() => { setLang(l.code); setOpen(false); }} lang={l.code}>
                <span>{l.native}</span>
                {l.code === lang && <Icon name="check" size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AccountMenu() {
  const { user, logout, t } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!user) return <Link className="btn subtle" to="/login">{t("login")}</Link>;
  return (
    <div className="menu" ref={ref}>
      <button className="avatar" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label={user.username}>
        {user.username.slice(0, 1).toUpperCase()}
      </button>
      {open && (
        <div className="menu-pop account" role="menu">
          <div className="account-id">
            <strong>{user.username}</strong>
            <span>{user.email}</span>
          </div>
          <button role="menuitem" onClick={logout}><Icon name="logout" size={16} /> {t("logout")}</button>
        </div>
      )}
    </div>
  );
}

export default function Header({ children, center }) {
  const { theme, toggleTheme, muted, toggleMuted, t } = useApp();

  return (
    <header className="header">
      <Link to="/" className="brand" aria-label="The Silent Voice">
        <Logo />
        <span className="brand-name">The Silent Voice</span>
      </Link>

      {center && <div className="header-center">{center}</div>}

      <div className="header-actions">
        {children}
        <LanguageMenu />
        <button className="icon-btn" onClick={toggleMuted} aria-label={muted ? t("unmute") : t("mute")} title={muted ? t("unmute") : t("mute")}>
          <Icon name={muted ? "volumeOff" : "volume"} />
        </button>
        <button className="icon-btn" onClick={toggleTheme} aria-label={t("theme")} title={t("theme")}>
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <AccountMenu />
      </div>
    </header>
  );
}
