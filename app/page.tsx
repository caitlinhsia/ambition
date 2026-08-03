"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { TYPES } from "@/lib/quiz";
import Landing from "@/components/Landing";
import Auth from "@/components/Auth";
import Onboarding from "@/components/Onboarding";
import Tutorial from "@/components/Tutorial";
import Record from "@/components/Record";
import SubNav from "@/components/SubNav";
import SectionHeader from "@/components/SectionHeader";
import Walls from "@/components/Walls";
import WallView from "@/components/WallView";
import StartDoor from "@/components/StartDoor";
import AreaDoor from "@/components/AreaDoor";
import Shrinker from "@/components/Shrinker";
import StartWithMe from "@/components/StartWithMe";
import HabitBuilder from "@/components/HabitBuilder";
import Trackers from "@/components/Trackers";
import TodayStrip from "@/components/TodayStrip";
import Journal from "@/components/Journal";
import PlanTomorrow, { TodaysPlans } from "@/components/PlanTomorrow";

/** Four sections. Everything else is a mode inside one of them. */
type Section = "home" | "start" | "build" | "you";
type StartMode = "quick" | "areas" | "shrink" | "together";
type BuildMode = "habits" | "track";
type YouMode = "journal" | "record";

const SECTIONS: { k: Section; label: string }[] = [
  { k: "home", label: "your wall" },
  { k: "start", label: "one brick" },
  { k: "build", label: "build" },
  { k: "you", label: "you" },
];

const START_MODES: { k: StartMode; label: string }[] = [
  { k: "quick", label: "give me one" },
  { k: "shrink", label: "shrink a thing" },
  { k: "areas", label: "pick a lane" },
  { k: "together", label: "together" },
];

const BUILD_MODES: { k: BuildMode; label: string }[] = [
  { k: "habits", label: "habits" },
  { k: "track", label: "trackers" },
];

const YOU_MODES: { k: YouMode; label: string }[] = [
  { k: "record", label: "your record" },
  { k: "journal", label: "journal" },
];

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
      <button onClick={onClick} className="markbtn" aria-label="go home">
        {inner}
      </button>
    </h1>
  );
}

export default function Home() {
  const s = useStore();
  const [section, setSection] = useState<Section>("home");
  const [startMode, setStartMode] = useState<StartMode>("quick");
  const [buildMode, setBuildMode] = useState<BuildMode>("habits");
  const [youMode, setYouMode] = useState<YouMode>("record");
  const [lateNight, setLateNight] = useState(false);
  const [gate, setGate] = useState<Gate>("landing");
  const [authMode, setAuthMode] = useState<"up" | "in">("up");
  const [skippedAuth, setSkippedAuth] = useState(false);
  const [replayTutorial, setReplayTutorial] = useState(false);
  const [openWall, setOpenWall] = useState<string | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setLateNight(h >= 23 || h < 5);
  }, []);

  /** Jump straight to a mode from anywhere (the dashboard shortcuts use this). */
  function go(target: StartMode | BuildMode | "home") {
    if (target === "home") return setSection("home");
    if ((START_MODES as { k: string }[]).some((m) => m.k === target)) {
      setStartMode(target as StartMode);
      return setSection("start");
    }
    if ((BUILD_MODES as { k: string }[]).some((m) => m.k === target)) {
      setBuildMode(target as BuildMode);
      return setSection("build");
    }
    setSection("you");
  }

  if (!s.ready) {
    return (
      <main className="wrap">
        <div className="mast">
          <Mark />
        </div>
      </main>
    );
  }

  if (!s.account && !skippedAuth) {
    return (
      <main className="wrap">
        <div className="mast">
          <Mark onClick={() => setGate("landing")} />
          <span className="tag">brick by brick.</span>
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
              onIn={(a, mode) => s.useAccount(a, { claimGuest: mode === "up" })}
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
          <span className="tag">brick by brick.</span>
        </div>
        <Onboarding onDone={(p) => s.setProfile({ ...p, onboarded: true })} />
        <Foot />
      </main>
    );
  }

  // First run after the quiz: explain how the thing works before turning
  // someone loose in it.
  if (!s.state.profile.tutorialDone || replayTutorial) {
    return (
      <main className="wrap">
        <div className="mast">
          <Mark />
          <span className="tag">brick by brick.</span>
        </div>
        <Tutorial
          onDone={() => {
            setReplayTutorial(false);
            if (!s.state.profile.tutorialDone) s.setProfile({ tutorialDone: true });
          }}
        />
        <Foot />
      </main>
    );
  }

  const type = s.state.profile.typeKey ? TYPES[s.state.profile.typeKey] : null;
  const todayKey = new Date().toISOString().slice(0, 10);
  const startedToday = s.state.receipts.filter(
    (r) => new Date(r.at).toISOString().slice(0, 10) === todayKey
  ).length;

  return (
    <main className="wrap">
      <div className="mast">
        <Mark onClick={() => setSection("home")} />
        <span className="tag">brick by brick.</span>
        <span className="spacer" />
        <button
          className="helpbtn"
          onClick={() => setReplayTutorial(true)}
          aria-label="how budg3 works"
          title="how it works"
        >
          ?
        </button>
        {s.account ? (
          <button
            className="link"
            style={{ marginTop: 0 }}
            onClick={() => {
              // Someone signing out has an account, so send them back to the
              // front door with sign-in ready. Leaving the form on "create an
              // account" meant typing your own email got you an error.
              s.signOut();
              setAuthMode("in");
              setGate("landing");
            }}
          >
            sign out
          </button>
        ) : (
          <button className="link" style={{ marginTop: 0 }} onClick={() => setSkippedAuth(false)}>
            save my stuff →
          </button>
        )}
      </div>

      <nav className="nav">
        {SECTIONS.map((t) => (
          <button key={t.k} aria-current={section === t.k} onClick={() => setSection(t.k)}>
            {t.label}
          </button>
        ))}
      </nav>

      {lateNight && (section === "home" || section === "start") ? (
        <div style={{ marginBottom: 14 }}>
          <div className="panel">
            <h2 className="h">it&apos;s late — play it smart.</h2>
            <p className="sub">
              after 11 the winning move is setting tomorrow up, not starting something new.
            </p>
          </div>
          <PlanTomorrow plans={s.state.plans} onAdd={s.addPlan} onRemove={s.removePlan} />
        </div>
      ) : null}

      {section === "home" &&
        (() => {
          const wall = s.state.walls.find((w) => w.id === openWall);
          if (wall) {
            return (
              <WallView
                wall={wall}
                onKnock={(b) => s.knockBrick(wall.id, b)}
                onSetState={(b, st) => s.setBrickState(wall.id, b, st)}
                onEdit={(b, t) => s.editBrick(wall.id, b, t)}
                onRemoveBrick={(b) => s.removeBrick(wall.id, b)}
                onAddBrick={(t) => s.addBrick(wall.id, t)}
                onRemoveWall={() => {
                  s.removeWall(wall.id);
                  setOpenWall(null);
                }}
                onBack={() => setOpenWall(null)}
              />
            );
          }
          return (
            <>
              <SectionHeader
                title={startedToday > 0 ? `${startedToday} out today` : "what's in your way?"}
                blurb={
                  startedToday > 0
                    ? "the wall's thinner than it was this morning."
                    : "name it, and budg3 breaks it into bricks you can actually lift."
                }
                count={startedToday}
              />
              <TodaysPlans
                plans={s.state.plans}
                onComplete={s.completePlan}
                onRemove={s.removePlan}
              />
              <Walls
                walls={s.state.walls}
                type={type}
                onOpen={(id) => setOpenWall(id)}
                onAdd={(n, steps) => s.addWall(n, steps)}
              />
              <p className="note" style={{ margin: "18px 0 0" }}>
                don&apos;t want to name anything?{" "}
                <button
                  className="link"
                  style={{ marginTop: 0 }}
                  onClick={() => setSection("start")}
                >
                  just give me one brick →
                </button>
              </p>
            </>
          );
        })()}

      {section === "start" && (
        <>
          <SectionHeader
            title="pick up a brick"
            blurb="four ways at the wall. take whichever one you'll actually use right now."
            count={startedToday}
          />
          <TodayStrip state={s.state} onUndo={s.undoStart} />
          <SubNav items={START_MODES} value={startMode} onChange={setStartMode} />
          {startMode === "quick" && (
            <StartDoor
              onStarted={(text, feeling) => s.recordStart(text, feeling)}
              favours={type?.favours}
              cue={type?.cue}
            />
          )}
          {startMode === "areas" && <AreaDoor onStarted={(text) => s.recordStart(text)} />}
          {startMode === "shrink" && <Shrinker onStarted={(text) => s.recordStart(text)} />}
          {startMode === "together" && <StartWithMe onStarted={(text) => s.recordStart(text)} />}
        </>
      )}

      {section === "build" && (
        <>
          <SectionHeader
            title="what you're building"
            blurb="habits you chose and numbers you care about. a missed day pauses a run, it never wipes it."
            count={s.state.habits.filter((h) => h.days.includes(todayKey)).length}
          />
          <TodayStrip state={s.state} onUndo={s.undoStart} />
          <SubNav items={BUILD_MODES} value={buildMode} onChange={setBuildMode} />
          {buildMode === "habits" && (
            <HabitBuilder
              habits={s.state.habits}
              onAdd={s.addHabit}
              onToggle={s.toggleHabitToday}
              onRemove={s.removeHabit}
            />
          )}
          {buildMode === "track" && (
            <Trackers
              trackers={s.state.trackers}
              onAdd={s.addTracker}
              onBump={s.bumpTracker}
              onRemove={s.removeTracker}
            />
          )}
        </>
      )}

      {section === "you" && (
        <>
          <SectionHeader
            title="your record"
            blurb="a line a day if you want one, and every brick you've pulled out so far."
            count={Math.min(8, Math.ceil(s.state.started / 5))}
          />
          <SubNav items={YOU_MODES} value={youMode} onChange={setYouMode} />
          {youMode === "record" && (
            <Record state={s.state} onExport={s.exportAll} onWipe={s.wipe} />
          )}
          {youMode === "journal" && (
            <Journal
              entries={s.state.journal}
              dayLogs={s.state.dayLogs}
              trackers={s.state.trackers}
              onAdd={s.addJournal}
              onRemove={s.removeJournal}
              onDayLog={s.setDayLog}
              onAddTracker={s.addTracker}
              onBump={s.bumpTracker}
              onSetCount={s.setTrackerToday}
              onSetGoal={s.setTrackerGoal}
              onRemoveTracker={s.removeTracker}
            />
          )}
        </>
      )}

      <Foot />
    </main>
  );
}

function Foot() {
  return (
    <footer className="foot">
      <span>budg3 — brick by brick</span>
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
