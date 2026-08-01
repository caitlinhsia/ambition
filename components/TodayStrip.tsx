"use client";

import { useEffect, useRef, useState } from "react";
import { Receipt, State, streakOf, today } from "@/lib/store";

/**
 * A persistent record of the session, pinned above whatever you're doing.
 *
 * Without this, finishing something moved you straight on and the only proof
 * was a number on a screen you weren't looking at — so the work felt like it
 * evaporated. Here the count ticks up in front of you and the things you've
 * done stay on screen.
 */
export default function TodayStrip({ state }: { state: State }) {
  const t = today();
  const doneToday: Receipt[] = state.receipts.filter(
    (r) => new Date(r.at).toISOString().slice(0, 10) === t
  );
  const habitsDone = state.habits.filter((h) => h.days.includes(t)).length;
  const bestRun = state.habits.reduce((m, h) => Math.max(m, streakOf(h.days).run), 0);

  // Pop the number when it changes, so the increment is something you see.
  const [bump, setBump] = useState(false);
  const prev = useRef(doneToday.length);
  useEffect(() => {
    if (doneToday.length > prev.current) {
      setBump(true);
      const id = setTimeout(() => setBump(false), 520);
      prev.current = doneToday.length;
      return () => clearTimeout(id);
    }
    prev.current = doneToday.length;
  }, [doneToday.length]);

  const marks = Math.min(doneToday.length, 12);

  return (
    <div className="today">
      <div className="today-top">
        <span className="today-count">
          <b className={bump ? "pop" : undefined}>{doneToday.length}</b>
          <span className="today-label">
            {doneToday.length === 1 ? "start today" : "starts today"}
          </span>
        </span>

        <span className="today-marks" aria-hidden="true">
          {Array.from({ length: marks }, (_, i) => (
            <i key={i} className={i === marks - 1 && bump ? "mark fresh" : "mark"} />
          ))}
          {doneToday.length > 12 ? <span className="more">+{doneToday.length - 12}</span> : null}
        </span>

        <span className="today-meta">
          {state.habits.length > 0 ? (
            <span>
              {habitsDone}/{state.habits.length} habits
            </span>
          ) : null}
          {bestRun > 0 ? <span>{bestRun} day run</span> : null}
          <span>{state.started} all time</span>
        </span>
      </div>

      {doneToday.length > 0 ? (
        <ul className="today-list">
          {doneToday.slice(0, 4).map((r) => (
            <li key={r.id}>{r.text}</li>
          ))}
          {doneToday.length > 4 ? <li className="muted">+{doneToday.length - 4} more</li> : null}
        </ul>
      ) : (
        <p className="today-empty">nothing yet today. the first one is the hard one.</p>
      )}
    </div>
  );
}
