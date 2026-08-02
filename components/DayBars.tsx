"use client";

import { useState } from "react";
import { Tracker, today } from "@/lib/store";
import { targetFor, segmented } from "@/lib/daily";
import { celebrate } from "./Celebrate";

/** Bars you fill in for the day.
 *
 * These read from the same trackers as the build section — one number, shown
 * twice. Fill a bar here and the sparkline there moves.
 *
 * A bar can be filled but never failed. It has no red state, no overdue, and
 * going past the end is shown as going past the end, not as an error. The
 * target is a length for the bar, not a line you fall below.
 */

const QUICK: { name: string; unit: string }[] = [
  { name: "water", unit: "cups" },
  { name: "minutes outside", unit: "mins" },
  { name: "sleep", unit: "hrs" },
  { name: "moving", unit: "mins" },
  { name: "study", unit: "mins" },
  { name: "screen-free time", unit: "mins" },
];

function Bar({
  tracker,
  onBump,
  onSet,
  onGoal,
  onRemove,
}: {
  tracker: Tracker;
  onBump: (id: string, by: number) => void;
  onSet: (id: string, n: number) => void;
  onGoal: (id: string, goal: number | null) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  // Removing a bar takes its whole history with it, and × sits two taps from
  // the + you press every day. Asking once costs nothing; a mis-tap costs weeks.
  const [confirming, setConfirming] = useState(false);
  /** Non-null only while the number field has focus. */
  const [typing, setTyping] = useState<string | null>(null);
  const n = tracker.counts[today()] ?? 0;
  const { target, source, note } = targetFor(tracker);
  const pct = Math.min(100, (n / target) * 100);
  const over = n - target;

  return (
    <li className="daybar">
      <div className="dbhead">
        <span className="dbname">{tracker.name}</span>
        <span className="dbcount">
          {n} / {target} {tracker.unit}
          {over > 0 ? <b className="dbover"> +{over} past it</b> : null}
        </span>
      </div>

      {segmented(target) ? (
        <div
          className="dbsegs"
          role="group"
          aria-label={`${tracker.name}: ${n} of ${target} ${tracker.unit}`}
        >
          {Array.from({ length: target }, (_, i) => {
            const filled = i < n;
            return (
              <button
                key={i}
                className={"dbseg" + (filled ? " on" : "")}
                // Tapping the last filled segment un-fills it, so a mis-tap
                // costs one tap to fix rather than a trip to the number field.
                onClick={(e) => {
                  const next = n === i + 1 ? i : i + 1;
                  if (next > n) celebrate(e.currentTarget);
                  onSet(tracker.id, next);
                }}
                aria-label={`set to ${i + 1} ${tracker.unit}`}
              />
            );
          })}
          {over > 0 ? <span className="dbextra">+{over}</span> : null}
        </div>
      ) : (
        <div className="dbtrack" aria-label={`${n} of ${target} ${tracker.unit}`}>
          <span className="dbfill" style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="dbrow">
        <button className="iconbtn" onClick={() => onBump(tracker.id, -1)} aria-label={`less ${tracker.name}`}>
          −
        </button>
        <button
          className="iconbtn on"
          onClick={(e) => {
            celebrate(e.currentTarget);
            onBump(tracker.id, 1);
          }}
          aria-label={`more ${tracker.name}`}
        >
          +
        </button>
        {/* While you're typing, the field holds your text; the rest of the
            time it follows the count. Without that, clearing it to retype
            writes a 0 over the day before you've typed the new number. */}
        <input
          className="dbnum"
          type="number"
          min={0}
          inputMode="numeric"
          value={typing ?? String(n)}
          onChange={(e) => {
            const v = e.target.value;
            setTyping(v);
            if (v !== "" && Number.isFinite(Number(v))) onSet(tracker.id, Number(v));
          }}
          onBlur={() => setTyping(null)}
          aria-label={`exact ${tracker.name} today`}
        />
        <button
          className="dbnote"
          onClick={() => {
            setDraft(String(target));
            setEditing(!editing);
          }}
        >
          {source === "goal" ? "your goal" : note}
        </button>
        {confirming ? (
          <>
            <button className="dbconfirm" onClick={() => onRemove(tracker.id)}>
              remove {tracker.name}?
            </button>
            <button className="iconbtn" onClick={() => setConfirming(false)} aria-label="keep it">
              keep
            </button>
          </>
        ) : (
          <button
            className="iconbtn"
            onClick={() => setConfirming(true)}
            aria-label={`remove ${tracker.name}`}
          >
            ×
          </button>
        )}
      </div>

      {editing ? (
        <form
          className="field dbgoal"
          onSubmit={(e) => {
            e.preventDefault();
            onGoal(tracker.id, Number(draft) > 0 ? Number(draft) : null);
            setEditing(false);
          }}
        >
          {/* min={0}, not 1: the handler below reads 0 as "no goal, you
              pick", and min={1} had the browser block that submit outright —
              so typing 0 did nothing at all while clearing the field worked. */}
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={draft}
            placeholder="0 to let budg3 pick"
            onChange={(e) => setDraft(e.target.value)}
            aria-label={`goal for ${tracker.name}`}
          />
          <button className="btn ghost" type="submit">
            set goal
          </button>
          {source === "goal" ? (
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                onGoal(tracker.id, null);
                setEditing(false);
              }}
            >
              let budg3 pick
            </button>
          ) : null}
        </form>
      ) : null}
    </li>
  );
}

export default function DayBars({
  trackers,
  onAdd,
  onBump,
  onSet,
  onGoal,
  onRemove,
}: {
  trackers: Tracker[];
  onAdd: (name: string, unit: string) => void;
  onBump: (id: string, by: number) => void;
  onSet: (id: string, n: number) => void;
  onGoal: (id: string, goal: number | null) => void;
  onRemove: (id: string) => void;
}) {
  const existing = new Set(trackers.map((t) => t.name.toLowerCase()));
  const missing = QUICK.filter((q) => !existing.has(q.name.toLowerCase()));

  return (
    <div className="panel">
      <h2 className="h">the small stuff</h2>
      <p className="sub">
        {trackers.length > 0
          ? "fill in what you did. part of a bar is still part of a bar."
          : "the small things that quietly decide how a day goes. pick any."}
      </p>

      {trackers.length > 0 ? (
        <ul className="daybars">
          {trackers.map((tr) => (
            <Bar
              key={tr.id}
              tracker={tr}
              onBump={onBump}
              onSet={onSet}
              onGoal={onGoal}
              onRemove={onRemove}
            />
          ))}
        </ul>
      ) : null}

      {missing.length > 0 ? (
        <div className="chips" style={{ marginTop: trackers.length > 0 ? 16 : 0 }}>
          {missing.map((q) => (
            <button
              key={q.name}
              className="chip"
              onClick={(e) => {
                celebrate(e.currentTarget);
                onAdd(q.name, q.unit);
              }}
            >
              + {q.name}
            </button>
          ))}
        </div>
      ) : null}

      {trackers.length > 0 ? (
        <p className="note" style={{ margin: "14px 0 0" }}>
          bars start at a sensible length — tap it to make it your own number.
          these are the same counts as the trackers in what you&apos;re building.
        </p>
      ) : null}
    </div>
  );
}
