"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { TYPES } from "@/lib/quiz";
import Landing from "@/components/Landing";
import Auth from "@/components/Auth";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import StartDoor from "@/components/StartDoor";
import AreaDoor from "@/components/AreaDoor";
import Shrinker from "@/components/Shrinker";
import StartWithMe from "@/components/StartWithMe";
import HabitBuilder from "@/components/HabitBuilder";
import Trackers from "@/components/Trackers";
import Receipts from "@/components/Receipts";
import TodayStrip from "@/components/TodayStrip";

export type Tab =
  | "home"
  | "start"
  | "areas"
  | "shrink"
  | "together"
  | "habits"
  | "track"
  | "receipts";

const TABS: { k: Tab; label: string }[] = [
  { k: "home", label: "home" },
  { k: "start", label: "start" },
  { k: "areas", label: "pick a lane" },
  { k: "shrink", label: "shrink a thing" },
  { k: "together", label: "start with me" },
  { k: "habits", label: "habits" },
  { k: "track", label: "track" },
  { k: "receipts", label: "receipts" },
];

/** Landing → sign-up → quiz → the app itself. */
type Gate = "landing" | "auth";

function Mark({ onClick }: { onClick?: () => void }) {
  const inner = (
    <>
      budg<span className="three">3</span>
      <span className="caret" aria-hidden="true" />
    </>
  );
  if (!onClick) return <h1 className="mark">{inner}</h1>;
  return (
    <h1 className="mark">
      <button
        onClick={onClick}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          fontFamily: "inherit",
          fontWeight: "inherit",
          letterSpacing: "inherit",
        }}
        aria-label="go home"
      >
        {inner}
      </button>
    </h1>
  );
}

export default function Home() {
  const s = useStore();
  const [tab, setTab] = useState<Tab>("home");
  const [lateNight, setLateNight] = useState(false);
  const [gate, setGate] = useState<Gate>("landing");
  const [authMode, setAuthMode] = useState<"up" | "in">("up");
  const [skippedAuth, setSkippedAuth] = useState(false);

  useEffect(() => {
    // Wind-down mode: late at night budg3 stops handing you projects.
    const h = new Date().getHours();
    setLateNight(h >= 23 || h < 5);
  }, []);

  if (!s.ready) {
    return (
      <main className="wrap">
        <div className="mast">
          <Mark />
        </div>
      </main>
    );
  }

  // ---- signed out, hasn't skipped: landing page, then the form ----
  if (!s.account && !skippedAuth) {
    return (
      <main className="wrap">
        <div className="mast">
          <Mark onClick={() => setGate("landing")} />
          <span className="tag">learn to start.</span>
        </div>
        {gate === "landing" ? (
          <Landing
            onSignUp={() => {
              setAuthMode("up");
              setGate("auth");
            }}
            onSignIn={() => {
              setAuthMode("in");
              setGate("auth");
            }}
            onSkip={() => setSkippedAuth(true)}
          />
        ) : (
          <>
            <Auth
              initialMode={authMode}
              onIn={(a) => s.useAccount(a)}
              onSkip={() => setSkippedAuth(true)}
            />
            <button className="link" onClick={() => setGate("landing")}>
              ← back
            </button>
          </>
        )}
        <Foot />
      </main>
    );
  }

  if (!s.state.profile.onboarded) {
    return (
      <main className="wrap">
        <div className="mast">
          <Mark />
          <span className="tag">learn to start.</span>
        </div>
        <Onboarding onDone={(p) => s.setProfile({ ...p, onboarded: true })} />
        <Foot />
      </main>
    );
  }

  const type = s.state.profile.typeKey ? TYPES[s.state.profile.typeKey] : null;

  return (
    <main className="wrap">
      <div className="mast">
        <Mark onClick={() => setTab("home")} />
        <span className="tag">learn to start.</span>
        <span className="spacer" />
        {type ? <span className="tag">{type.name}</span> : null}
        {s.account ? (
          <button className="link" style={{ marginTop: 0 }} onClick={s.signOut}>
            sign out
          </button>
        ) : (
          <button className="link" style={{ marginTop: 0 }} onClick={() => setSkippedAuth(false)}>
            save my stuff →
          </button>
        )}
      </div>

      <nav className="nav">
        {TABS.map((t) => (
          <button key={t.k} aria-current={tab === t.k} onClick={() => setTab(t.k)}>
            {t.label}
          </button>
        ))}
      </nav>

      {lateNight && (tab === "start" || tab === "home") ? (
        <div className="panel" style={{ marginBottom: 14 }}>
          <h2 className="h">it&apos;s late — play it smart.</h2>
          <p className="sub">
            after 11 the winning move is setting tomorrow up, not starting something new.
          </p>
        </div>
      ) : null}

      {tab !== "home" && tab !== "receipts" ? <TodayStrip state={s.state} onUndo={s.undoStart} /> : null}

      {tab === "home" && (
        <Dashboard
          state={s.state}
          onGo={setTab}
          onToggleHabit={s.toggleHabitToday}
          onBumpTracker={s.bumpTracker}
        />
      )}
      {tab === "start" && <StartDoor onStarted={(text, feeling) => s.recordStart(text, feeling)} />}
      {tab === "areas" && <AreaDoor onStarted={(text) => s.recordStart(text)} />}
      {tab === "shrink" && <Shrinker onStarted={(text) => s.recordStart(text)} />}
      {tab === "together" && <StartWithMe onStarted={(text) => s.recordStart(text)} />}
      {tab === "habits" && (
        <HabitBuilder
          habits={s.state.habits}
          onAdd={s.addHabit}
          onToggle={s.toggleHabitToday}
          onRemove={s.removeHabit}
        />
      )}
      {tab === "track" && (
        <Trackers
          trackers={s.state.trackers}
          onAdd={s.addTracker}
          onBump={s.bumpTracker}
          onRemove={s.removeTracker}
        />
      )}
      {tab === "receipts" && (
        <Receipts receipts={s.state.receipts} onExport={s.exportAll} onWipe={s.wipe} />
      )}

      <Foot />
    </main>
  );
}

function Foot() {
  return (
    <footer className="foot">
      <span>budg3 — learn to start</span>
      <span>your stuff stays yours</span>
      <span>
        having a rough time?{" "}
        <a className="help" href="https://988lifeline.org/" target="_blank" rel="noreferrer">
          there are people who will talk to you
        </a>
      </span>
    </footer>
  );
}
