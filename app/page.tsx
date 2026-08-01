"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { TYPES } from "@/lib/quiz";
import Onboarding from "@/components/Onboarding";
import StartDoor from "@/components/StartDoor";
import Shrinker from "@/components/Shrinker";
import StartWithMe from "@/components/StartWithMe";
import KeepGoing from "@/components/KeepGoing";
import Receipts from "@/components/Receipts";
import Garden from "@/components/Garden";

type Tab = "start" | "shrink" | "together" | "keep" | "receipts";

const TABS: { k: Tab; label: string }[] = [
  { k: "start", label: "start" },
  { k: "shrink", label: "shrink a thing" },
  { k: "together", label: "start with me" },
  { k: "keep", label: "keep going" },
  { k: "receipts", label: "receipts" },
];

export default function Home() {
  const s = useStore();
  const [tab, setTab] = useState<Tab>("start");
  const [lateNight, setLateNight] = useState(false);

  useEffect(() => {
    // Wind-down mode: late at night budge stops handing you projects.
    const h = new Date().getHours();
    setLateNight(h >= 23 || h < 5);
  }, []);

  if (!s.ready) {
    return (
      <main className="wrap">
        <div className="mast">
          <h1 className="mark">
            budge<span className="caret" aria-hidden="true" />
          </h1>
        </div>
      </main>
    );
  }

  if (!s.state.profile.onboarded) {
    return (
      <main className="wrap">
        <div className="mast">
          <h1 className="mark">
            budge<span className="caret" aria-hidden="true" />
          </h1>
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
        <h1 className="mark">
          budge<span className="caret" aria-hidden="true" />
        </h1>
        <span className="tag">learn to start.</span>
        <span className="spacer" />
        {type ? <span className="tag">{type.name}</span> : null}
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
      {tab === "shrink" && <Shrinker onStarted={(text) => s.recordStart(text)} />}
      {tab === "together" && <StartWithMe onStarted={(text) => s.recordStart(text)} />}
      {tab === "keep" && (
        <KeepGoing
          habits={s.state.habits}
          trackers={s.state.trackers}
          onAddHabit={s.addHabit}
          onToggleHabit={s.toggleHabitToday}
          onRemoveHabit={s.removeHabit}
          onAddTracker={s.addTracker}
          onBumpTracker={s.bumpTracker}
          onRemoveTracker={s.removeTracker}
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
      <span>budge — learn to start</span>
      <span>nothing leaves your device</span>
      <span>
        having a rough time?{" "}
        <a className="help" href="https://988lifeline.org/" target="_blank" rel="noreferrer">
          there are people who will talk to you
        </a>
      </span>
    </footer>
  );
}
