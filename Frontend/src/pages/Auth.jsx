import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../lib/api";
import Header from "../components/Header";
import { Icon, Logo } from "../components/Icons";

const POINTS = [
  { icon: "globe", title: "English · हिन्दी · বাংলা · தமிழ்", body: "Every sign is spoken and written in your language." },
  { icon: "hand", title: "Everyday signs and ASL", body: "Quick custom signs, or fingerspell any word." },
  { icon: "shield", title: "Private by design", body: "Camera video is processed on your device and never uploaded." },
];

function Shell({ title, subtitle, children }) {
  return (
    <div className="app">
      <Header />
      <main className="auth-wrap">
        <div className="auth-split">
          <aside className="auth-brand">
            <Logo size={44} />
            <h2>The Silent Voice</h2>
            <p>Your hands speak. We make them heard.</p>
            <ul>
              {POINTS.map((p) => (
                <li key={p.icon}>
                  <span className="pt-icon"><Icon name={p.icon} size={18} /></span>
                  <span><strong>{p.title}</strong><small>{p.body}</small></span>
                </li>
              ))}
            </ul>
          </aside>
          <section className="auth-card">
            <h1>{title}</h1>
            <p className="muted">{subtitle}</p>
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}

export function Login() {
  const { t, finishAuth } = useApp();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      finishAuth(await api("/auth/login", { method: "POST", body: form }));
      nav("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Welcome back" subtitle="Sign in to open your translator and history.">
      <form onSubmit={submit} className="form">
        <label>
          {t("emailOrUser")}
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="username" required autoFocus />
        </label>
        <label>
          {t("password")}
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
        </label>
        {error && <p className="banner bad" role="alert">{error}</p>}
        <button className="btn primary lg block" disabled={busy}>{busy ? t("wait") : t("login")}</button>
      </form>
      <p className="auth-foot">{t("noAccount")} <Link to="/register">{t("register")}</Link></p>
    </Shell>
  );
}

export function Register() {
  const { t, finishAuth } = useApp();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      finishAuth(await api("/auth/register", { method: "POST", body: form }));
      nav("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Create your account" subtitle="Takes a few seconds. Your history follows you across devices.">
      <form onSubmit={submit} className="form">
        <label>
          {t("username")}
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required minLength={2} autoFocus />
        </label>
        <label>
          {t("email")}
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
        </label>
        <label>
          {t("password")}
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required minLength={6} />
          <small className="muted">{t("passwordHint")}</small>
        </label>
        {error && <p className="banner bad" role="alert">{error}</p>}
        <button className="btn primary lg block" disabled={busy}>{busy ? t("wait") : t("register")}</button>
      </form>
      <p className="auth-foot">{t("haveAccount")} <Link to="/login">{t("login")}</Link></p>
    </Shell>
  );
}
