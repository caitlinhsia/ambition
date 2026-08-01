"use client";

import { useState } from "react";
import { Tracker, today } from "@/lib/store";
import { celebrate } from "./Celebrate";

const SUGGESTIONS: { name: string; unit: string }[] = [
  { name: "water", unit: "cups" },
  { name: "focused work", unit: "hrs" },
  { name: "steps outside", unit: "walks" },
  { name: "pages read", unit: "pages" },
  { name: "workouts", unit: "sessions" },
  { name: "screen-free time", unit: "hrs" },
];

/**
 * Count whatever you decide matters. No targets and no goals on purpose —
 * a target you miss is just another way to fail, and nothing here should be
 * failable.
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
        <p className="eyebrow">// trackers</p>
        <h2 className="h">count whatever matters to you.</h2>
        <p className="sub">cups of water, hours of work, walks. your numbers, no targets to miss.</p>

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
                  <button className="iconbtn" onClick={() => onBump(tr.id, -1)} aria-label={`less ${tr.name}`}>
                    −
                  </button>
                  <button
                    className="iconbtn on"
                    onClick={() => {
                      celebrate();
                      onBump(tr.id, 1);
                    }}
                    aria-label={`more ${tr.name}`}
                  >
                    +
                  </button>
                  <button className="iconbtn" onClick={() => onRemove(tr.id)} aria-label={`remove ${tr.name}`}>
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="panel">
        <p className="eyebrow">// ideas</p>
        <h2 className="h">common ones.</h2>
        <div className="chips">
          {SUGGESTIONS.map((sug) => {
            const added = existing.has(sug.name.toLowerCase());
            return (
              <button
                key={sug.name}
                className={"chip" + (added ? " pos" : "")}
                disabled={added}
                onClick={() => {
                  celebrate();
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
