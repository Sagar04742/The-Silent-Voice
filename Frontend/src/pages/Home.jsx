import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { useHistory } from "../hooks/useHistory";
import { useHandTracker } from "../hooks/useHandTracker";
import { findGesture } from "../data/gestures";
import { resolvePair } from "../data/combos";
import { speak, startSiren, stopSiren, stopSpeaking } from "../lib/speech";
import Header from "../components/Header";
import CameraPanel from "../components/CameraPanel";
import OutputPanel from "../components/OutputPanel";
import PhrasePanel from "../components/PhrasePanel";
import HistoryPanel from "../components/HistoryPanel";
import GuideModal, { ASL_HINTS } from "../components/GuideModal";
import EmergencyOverlay from "../components/EmergencyOverlay";
import CalibratePanel from "../components/CalibratePanel";
import { setPersonalSamples } from "../lib/asl";
import { Icon } from "../components/Icons";

export default function Home() {
  const { lang, muted, user, t } = useApp();
  const history = useHistory(user);
  const [mode, setMode] = useState("everyday"); // everyday | asl
  const [current, setCurrent] = useState(null); // { id, at }
  const [text, setText] = useState(""); // ASL composer
  const [guideOpen, setGuideOpen] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [leftHanded, setLeftHanded] = useState(() => {
    try {
      return localStorage.getItem("sv_lefty") === "1";
    } catch {
      return false;
    }
  });
  const toggleLeft = () =>
    setLeftHanded((v) => {
      try {
        localStorage.setItem("sv_lefty", v ? "0" : "1");
      } catch {
        /* storage unavailable */
      }
      return !v;
    });

  // Personal ASL calibration samples, stored per account in this browser.
  const personalKey = `sv_personal_${user?.id}`;
  const [personal, setPersonal] = useState([]);
  useEffect(() => {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(personalKey) || "[]");
    } catch {
      /* ignore corrupt data */
    }
    setPersonal(saved);
    setPersonalSamples(saved);
  }, [personalKey]);
  const updatePersonal = useCallback(
    (next) => {
      setPersonal(next);
      setPersonalSamples(next);
      try {
        localStorage.setItem(personalKey, JSON.stringify(next.map((s) => ({ letter: s.letter, x: s.x.map((v) => +v.toFixed(4)) }))));
      } catch {
        /* storage full or unavailable */
      }
    },
    [personalKey],
  );

  // The tracker's commit callback is created once; keep it reading fresh values.
  const live = useRef({});
  live.current = { lang, muted, history, mode, text };

  // Speak a phrase in the UI language (or a forced language, e.g. English for ASL).
  const say = useCallback((phrase, forceLang) => {
    const { lang: l, muted: m } = live.current;
    const use = forceLang || l;
    if (!m) speak(phrase.text[use] ?? phrase.text.en, use);
  }, []);

  // A sign / phrase was confirmed: show it, speak it, remember it.
  const present = useCallback(
    (phrase, { speakIt = true } = {}) => {
      const { lang: l, history: h } = live.current;
      setCurrent({ id: phrase.id, at: Date.now() });
      if (speakIt) say(phrase);
      h.add({ gestureId: phrase.id, gesture: phrase.label[l], translation: phrase.text[l], language: l });
    },
    [say],
  );

  const triggerEmergency = useCallback(() => {
    present(findGesture("emergency"), { speakIt: false });
    setEmergency(true);
  }, [present]);

  const speakComposed = useCallback(() => {
    const { history: h, text: value } = live.current;
    const spoken = value.trim();
    if (!spoken) return;
    say({ text: { en: spoken } }, "en");
    h.add({ gestureId: "asl", gesture: "ASL", translation: spoken, language: "en" });
  }, [say]);

  const tracker = useHandTracker({
    mode, leftHanded,
    onCommit: ({ kind, id }) => {
      if (kind === "letter") return setText((v) => v + id.toLowerCase());
      if (kind === "control") {
        if (id === "space") setText((v) => (v && !v.endsWith(" ") ? v + " " : v));
        else if (id === "backspace") setText((v) => v.slice(0, -1));
        else speakComposed();
        return;
      }
      if (kind === "pair") {
        const [a, b] = id.split("+");
        return present(resolvePair(a, b));
      }
      const g = findGesture(id);
      if (!g) return;
      if (g.emergency) triggerEmergency();
      else present(g);
    },
  });

  // Siren + repeated spoken alert while the emergency screen is up.
  useEffect(() => {
    if (!emergency) return;
    startSiren();
    const alertPhrase = findGesture("emergency");
    const speakAlert = () => {
      if (!live.current.muted) speak(alertPhrase.text[live.current.lang], live.current.lang);
    };
    speakAlert();
    const timer = setInterval(speakAlert, 7000);
    return () => {
      clearInterval(timer);
      stopSiren();
      stopSpeaking();
    };
  }, [emergency]);

  const modeSwitch = (
    <div className="seg" role="tablist" aria-label="Mode">
      {[["everyday", t("modeEveryday")], ["asl", t("modeAsl")]].map(([id, label]) => (
        <button key={id} role="tab" aria-selected={mode === id} className={mode === id ? "on" : ""} onClick={() => setMode(id)}>
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="app">
      <Header center={modeSwitch}>
        <button className="btn subtle" onClick={() => setGuideOpen(true)}><Icon name="book" size={16} /> <span className="hide-sm">{t("signs")}</span></button>
        <button className="btn danger" onClick={triggerEmergency} aria-label="SOS"><Icon name="alert" size={16} /> {t("sos")}</button>
      </Header>

      <main className="layout">
        <div className="main-col">
          <CameraPanel tracker={tracker} mode={mode} />
          <OutputPanel
            mode={mode} current={current} onReplay={(p, l) => say(p, l)}
            text={text} setText={setText} onSpeak={speakComposed} live={tracker.live}
            onCalibrate={() => setCalibrating((c) => !c)} leftHanded={leftHanded} onToggleLeft={toggleLeft}
          />
          {mode === "asl" && calibrating && (
            <CalibratePanel
              tracker={tracker} samples={personal} onClose={() => setCalibrating(false)}
              onAdd={(add) => updatePersonal([...personal, ...add])} onReset={() => updatePersonal([])}
            />
          )}
          <PhrasePanel onPick={(p) => present(p)} />
        </div>
        <HistoryPanel history={history} onReplay={(p, l) => say(p, l)} />
      </main>

      {guideOpen && (
        <GuideModal
          initialTab={mode}
          letters={Object.keys(ASL_HINTS)}
          onClose={() => setGuideOpen(false)}
          onSpeak={(g) => !g.emergency && say(g)} // never sound the alarm from a guide tap
        />
      )}
      {emergency && <EmergencyOverlay onDismiss={() => setEmergency(false)} />}
    </div>
  );
}
