"use client";

import { useState } from "react";
import { Habit, Tracker, streakOf, today } from "@/lib/store";
import { celebrate } from "./Celebrate";

/**
 * The optional "keep going" layer — for when starting isn't the hard part
 * anymore. Streaks here pause on a miss; they never reset to zero and nothing
 * ever turns red. Trackers have no targets, so there's nothing to fail.
 */
export default function KeepGoing({
  habits,
  trackers,
  onAddHabit,
  onToggleHabit,
  onRemoveHabit,
  onAddTracker,
  onBumpTracker,
  onRemoveTracker,
}: {
  habits: Habit[];
  trackers: Tracker[];
  onAddHabit: (name: string) => void;
  onToggleHabit: (id: string) => void;
  onRemoveHabit: (id: string) => void;
  onAddTracker: (name: string, unit: string) => void;
  onBumpTracker: (id: string, by: number) => void;
  onRemoveTracker: (id: string) => void;
}) {
  const [habitName, setHabitName] = useState("");
  const [trackerName, setTrackerName] = useState("");
  const [trackerUnit, setTrackerUnit] = useState("");
  const t = today();

  return (
    <>
      <div className="panel">
        <p className="eyebrow">// habits &amp; gentle streaks</p>
        <h2 className="h">things you&apos;re building.</h2>
        <p className="sub">
          your call, not ours. miss a day and the run just pauses — it never resets to zero, and
          nothing here turns red.
        </p>

        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            const v = habitName.trim();
            if (!v) return;
            onAddHabit(v);
            setHabitName("");
          }}
        >
          <input
            type="text"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder="read, move, journal, drink water…"
            aria-label="new habit"
          />
          <button className="btn primary" type="submit">
            add
          </button>
        </form>

        {habits.length === 0 ? (
          <p className="empty">nothing here yet. that&apos;s fine — add one if you want one.</p>
        ) : (
          <ul className="list">
            {habits.map((h) => {
              const { run, total } = streakOf(h.days);
              const doneToday = h.days.includes(t);
              return (
                <li key={h.id}>
                  <button
                    className={"iconbtn" + (doneToday ? " on" : "")}
                    onClick={() => {
                      if (!doneToday) celebrate();
                      onToggleHabit(h.id);
                    }}
                    aria-pressed={doneToday}
                  >
                    {doneToday ? "done" : "mark"}
                  </button>
                  <span className="grow">
                    <span className="what">{h.name}</span>
                  </span>
                  <span className="count">
                    {run > 0 ? `${run} in a row · ` : ""}
                    {total} total
                  </span>
                  <button className="iconbtn" onClick={() => onRemoveHabit(h.id)} aria-label={`remove ${h.name}`}>
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="panel">
        <p className="eyebrow">// trackers</p>
        <h2 className="h">count whatever matters to you.</h2>
        <p className="sub">
          cups of water, hours of work, times you went outside. your metrics, your numbers, no
          targets to miss.
        </p>

        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            const v = trackerName.trim();
            if (!v) return;
            onAddTracker(v, trackerUnit.trim() || "times");
            setTrackerName("");
            setTrackerUnit("");
          }}
        >
          <input
            type="text"
            value={trackerName}
            onChange={(e) => setTrackerName(e.target.value)}
            placeholder="water, focused work, walks…"
            aria-label="new tracker"
          />
          <input
            type="text"
            value={trackerUnit}
            onChange={(e) => setTrackerUnit(e.target.value)}
            placeholder="unit (cups, hrs…)"
            aria-label="tracker unit"
            style={{ flex: "0 1 140px" }}
          />
          <button className="btn primary" type="submit">
            add
          </button>
        </form>

        {trackers.length === 0 ? (
          <p className="empty">no trackers yet. only add one if it&apos;d actually help.</p>
        ) : (
          <ul className="list">
            {trackers.map((tr) => {
              const n = tr.counts[t] ?? 0;
              return (
                <li key={tr.id}>
                  <span className="grow">
                    <span className="what">{tr.name}</span>
                    <span className="when">
                      today: {n} {tr.unit}
                    </span>
                  </span>
                  <button className="iconbtn" onClick={() => onBumpTracker(tr.id, -1)} aria-label={`less ${tr.name}`}>
                    −
                  </button>
                  <button
                    className="iconbtn on"
                    onClick={() => {
                      celebrate();
                      onBumpTracker(tr.id, 1);
                    }}
                    aria-label={`more ${tr.name}`}
                  >
                    +
                  </button>
                  <button className="iconbtn" onClick={() => onRemoveTracker(tr.id)} aria-label={`remove ${tr.name}`}>
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
