"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { TYPES } from "@/lib/quiz";
import Auth from "@/components/Auth";
import Onboarding from "@/components/Onboarding";
import StartDoor from "@/components/StartDoor";
import AreaDoor from "@/components/AreaDoor";
import Shrinker from "@/components/Shrinker";
import StartWithMe from "@/components/StartWithMe";
import HabitBuilder from "@/components/HabitBuilder";
import Trackers from "@/components/Trackers";
import Receipts from "@/components/Receipts";
import Garden from "@/components/Garden";

type Tab = "start" | "areas" | "shrink" | "together" | "habits" | "track" | "receipts";

const TABS: { k: Tab; label: string }[] = [
  { k: "start", label: "start" },
  { k: "areas", label: "pick a lane" },
  { k: "shrink", label: "shrink a thing" },
  { k: "together", label: "start with me" },
  { k: "habits", label: "habits" },
  { k: "track", label: "track" },
  { k: "receipts", label: "receipts" },
];

function Mark() {
  return (
    <h1 className="mark">
      budg<span className="three">3</span>
      <span className="caret" aria-hidden="true" />
    </h1>
  );
}

export default function Home() {
  const s = useStore();
  const [tab, setTab] = useState<Tab>("start");
  const [lateNight, setLateNight] = useState(false);
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

  // Signed out and hasn't chosen to skip yet.
  if (!s.account && !skippedAuth) {
    return (
      <main className="wrap">
        <div className="mast">
          <Mark />
          <span className="tag">learn to start.</span>
        </div>
        <Auth onIn={(a) => s.useAccount(a)} onSkip={() => setSkippedAuth(true)} />
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
        <Mark />
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

      {lateNight && tab === "start" ? (
        <div className="panel" style={{ marginBottom: 14 }}>
          <p className="eyebrow">// it&apos;s late</p>
          <h2 className="h">let&apos;s not start a project right now.</h2>
          <p className="sub">
            it&apos;s past 11. tonight the only good first step is the one that makes bed easier to
            get to — brush your teeth, put the phone on the charger across the room, close one tab.
          </p>
        </div>
      ) : null}

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

      <Garden started={s.state.started} />
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
