"use client";

import { Habit, Receipt, State, Tracker, streakOf, today } from "@/lib/store";
import { StartingType } from "@/lib/quiz";
import { celebrate } from "./Celebrate";
import WeekOverview from "./WeekOverview";
import WeekRow from "./WeekRow";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "still up?";
  if (h < 12) return "morning.";
  if (h < 18) return "afternoon.";
  if (h < 23) return "evening.";
  return "late one.";
}

/**
 * The home screen once you're in. Its job is to answer "where am I and what
 * now?" at a glance — today's habits, what's running, and one obvious way to
 * start something.
 */
const DOOR_LABEL: Record<string, string> = {
  start: "start something",
  areas: "pick a lane",
  shrink: "shrink a thing",
  together: "start with me",
};

export default function Dashboard({
  state,
  type,
  onGo,
  onToggleHabit,
  onBumpTracker,
}: {
  state: State;
  type?: StartingType | null;
  onGo: (tab: "start" | "areas" | "shrink" | "together" | "habits" | "track" | "receipts") => void;
  onToggleHabit: (id: string) => void;
  onBumpTracker: (id: string, by: number) => void;
}) {
  const t = today();
  const habits: Habit[] = state.habits;
  const trackers: Tracker[] = state.trackers;
  const doneToday = habits.filter((h) => h.days.includes(t)).length;
  const bestRun = habits.reduce((m, h) => Math.max(m, streakOf(h.days).run), 0);
  const recent: Receipt[] = state.receipts.slice(0, 4);
  const startedToday = state.receipts.filter(
    (r) => new Date(r.at).toISOString().slice(0, 10) === t
  ).length;

  return (
    <>
      <div className="panel">
        <h2 className="h">{greeting()}</h2>
        <p className="sub">
          {startedToday > 0
            ? `${startedToday} started today. keep it going.`
            : "nothing started yet today. one small thing?"}
        </p>

        <div className="tiles">
          <div className="tile">
            <span className="tn">{state.started}</span>
            <span className="tl">total starts</span>
          </div>
          <div className="tile">
            <span className="tn">{startedToday}</span>
            <span className="tl">today</span>
          </div>
          <div className="tile">
            <span className="tn">
              {doneToday}
              <span className="tsub">/{habits.length || 0}</span>
            </span>
            <span className="tl">habits done</span>
          </div>
          <div className="tile">
            <span className="tn">{bestRun}</span>
            <span className="tl">best run</span>
          </div>
        </div>

        {type ? <p className="typecue">{type.cue}</p> : null}

        <button
          className="btn primary big"
          style={{ marginTop: 16 }}
          onClick={() => onGo(type ? type.door : "start")}
        >
          {type ? DOOR_LABEL[type.door] : "start something now"}
        </button>
        {type ? (
          <p className="note" style={{ margin: "10px 0 0" }}>
            picked for {type.name}. everything else is in the tabs.
          </p>
        ) : null}
      </div>

      <WeekOverview state={state} />

      <div className="panel">
        <h2 className="h">today&apos;s habits</h2>
        {habits.length === 0 ? (
          <>
            <p className="sub">nothing here yet — pick a few and they&apos;ll show up each day.</p>
            <button className="btn ghost" onClick={() => onGo("habits")}>
              build some habits
            </button>
          </>
        ) : (
          <>
            <p className="sub">
              {doneToday === habits.length
                ? "all done today. nice."
                : `${habits.length - doneToday} left. no rush.`}
            </p>
            <ul className="list">
              {habits.slice(0, 6).map((h) => {
                const { run } = streakOf(h.days);
                const done = h.days.includes(t);
                return (
                  <li key={h.id}>
                    <button
                      className={"iconbtn" + (done ? " on" : "")}
                      onClick={(e) => {
                        if (!done) celebrate(e.currentTarget);
                        onToggleHabit(h.id);
                      }}
                      aria-pressed={done}
                    >
                      {done ? "done" : "mark"}
                    </button>
                    <span className="grow">
                      <span className="what">{h.name}</span>
                      {run > 0 ? <span className="when">{run} day run</span> : null}
                    </span>
                    <WeekRow habit={h} />
                  </li>
                );
              })}
            </ul>
            {habits.length > 6 ? (
              <button className="link" onClick={() => onGo("habits")}>
                see all {habits.length} →
              </button>
            ) : null}
          </>
        )}
      </div>

      {trackers.length > 0 ? (
        <div className="panel">
          <h2 className="h">today&apos;s numbers</h2>
          <ul className="list">
            {trackers.slice(0, 5).map((tr) => (
              <li key={tr.id}>
                <span className="grow">
                  <span className="what">{tr.name}</span>
                  <span className="when">
                    {tr.counts[t] ?? 0} {tr.unit}
                  </span>
                </span>
                <button
                  className="iconbtn on"
                  onClick={(e) => {
                    celebrate(e.currentTarget);
                    onBumpTracker(tr.id, 1);
                  }}
                  aria-label={`add one to ${tr.name}`}
                >
                  +1
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="panel">
        <h2 className="h">other ways in</h2>
        <div className="ways">
          <button className="way" onClick={() => onGo("shrink")}>
            <b>shrink a thing</b>
            <span>something specific you&apos;re dreading</span>
          </button>
          <button className="way" onClick={() => onGo("areas")}>
            <b>pick a lane</b>
            <span>school, body, making things…</span>
          </button>
          <button className="way" onClick={() => onGo("together")}>
            <b>start with me</b>
            <span>two minutes, side by side</span>
          </button>
          <button className="way" onClick={() => onGo("track")}>
            <b>track something</b>
            <span>water, hours, walks</span>
          </button>
        </div>
      </div>

      {recent.length > 0 ? (
        <div className="panel">
          <h2 className="h">lately</h2>
          <ul className="list">
            {recent.map((r) => (
              <li key={r.id}>
                <span className="grow">
                  <span className="when">
                    {new Date(r.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                  <span className="what">{r.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <button className="link" onClick={() => onGo("receipts")}>
            see everything →
          </button>
        </div>
      ) : null}
    </>
  );
}
