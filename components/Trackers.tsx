"use client";

import { useState } from "react";
import { Tracker, today } from "@/lib/store";
import { celebrate } from "./Celebrate";
import Sparkline from "./Sparkline";
import { trackerSeries } from "@/lib/history";
import { targetFor } from "@/lib/daily";

const SUGGESTIONS: { name: string; unit: string }[] = [
  { name: "water", unit: "cups" },
  { name: "focused work", unit: "hrs" },
  { name: "steps outside", unit: "walks" },
  { name: "pages read", unit: "pages" },
  { name: "workouts", unit: "sessions" },
  { name: "screen-free time", unit: "hrs" },
  { name: "sleep", unit: "hrs" },
  { name: "money saved", unit: "£" },
  { name: "practice", unit: "mins" },
  { name: "meals cooked", unit: "meals" },
  { name: "study", unit: "mins" },
  { name: "days without", unit: "days" },
];

/**
 * Count whatever you decide matters.
 *
 * These are the same counts the bars in the journal fill in — this view is
 * the history, that one is the day. Targets live here too, but only ever as
 * the length of a bar: nothing goes red, nothing is overdue, and a day under
 * the target is drawn exactly like a day over it. A target you can miss is
 * just another way to fail, and nothing here should be failable.
 */
export default function Trackers({
  trackers,
  onAdd,
  onBump,
  onRemove,
}: {
  trackers: Tracker[];
  onAdd: (name: string, unit: string) => void;
  onBump: (id: string, by: number) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const t = today();
  const existing = new Set(trackers.map((x) => x.name.toLowerCase()));

  return (
    <>
      <div className="panel">
        
        <h2 className="h">today</h2>
        <p className="sub">watch the numbers go up.</p>

        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            const v = name.trim();
            if (!v) return;
            onAdd(v, unit.trim() || "times");
            setName("");
            setUnit("");
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="what do you want to count?"
            aria-label="new tracker"
          />
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="unit"
            aria-label="tracker unit"
            style={{ flex: "0 1 120px" }}
          />
          <button className="btn primary" type="submit">
            add
          </button>
        </form>

        {trackers.length === 0 ? (
          <p className="empty">add one and start counting.</p>
        ) : (
          <ul className="list">
            {trackers.map((tr) => {
              const n = tr.counts[t] ?? 0;
              const { target } = targetFor(tr);
              return (
                <li key={tr.id} className="stacked">
                  <span className="grow">
                    <span className="what">{tr.name}</span>
                    <span className="when">
                      today: {n} of {target} {tr.unit}
                    </span>
                  </span>
                  <button className="iconbtn" onClick={() => onBump(tr.id, -1)} aria-label={`less ${tr.name}`}>
                    −
                  </button>
                  <button
                    className="iconbtn on"
                    onClick={(e) => {
                      celebrate(e.currentTarget);
                      onBump(tr.id, 1);
                    }}
                    aria-label={`more ${tr.name}`}
                  >
                    +
                  </button>
                  <button className="iconbtn" onClick={() => onRemove(tr.id)} aria-label={`remove ${tr.name}`}>
                    ×
                  </button>
                  <Sparkline series={trackerSeries(tr, 14)} unit={tr.unit} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="panel flat">
        <h2 className="h">ideas</h2>
        <div className="chips">
          {SUGGESTIONS.map((sug) => {
            const added = existing.has(sug.name.toLowerCase());
            return (
              <button
                key={sug.name}
                className={"chip" + (added ? " pos" : "")}
                disabled={added}
                onClick={(e) => {
                  celebrate(e.currentTarget);
                  onAdd(sug.name, sug.unit);
                }}
              >
                {added ? `${sug.name} ✓` : `+ ${sug.name}`}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
