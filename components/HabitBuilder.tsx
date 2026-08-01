"use client";

import { useState } from "react";
import { AREAS } from "@/lib/areas";
import { Habit, streakOf, today } from "@/lib/store";
import { celebrate } from "./Celebrate";

/**
 * The habit builder. Streaks here pause on a miss — they never reset to zero
 * and nothing turns red — but the run is shown proudly when it's going,
 * because a run genuinely feels good.
 */
export default function HabitBuilder({
  habits,
  onAdd,
  onToggle,
  onRemove,
}: {
  habits: Habit[];
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [openArea, setOpenArea] = useState<string | null>(null);
  const t = today();

  const existing = new Set(habits.map((h) => h.name.toLowerCase()));
  const doneToday = habits.filter((h) => h.days.includes(t)).length;

  return (
    <>
      <div className="panel">
        
        <h2 className="h">your habits</h2>
        <p className="sub">
          {habits.length === 0
            ? "add one below, or write your own."
            : `${doneToday} of ${habits.length} done today.`}
        </p>

        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            const v = name.trim();
            if (!v) return;
            onAdd(v);
            setName("");
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="write your own habit…"
            aria-label="new habit"
          />
          <button className="btn primary" type="submit">
            add
          </button>
        </form>

        {habits.length === 0 ? (
          <p className="empty">no habits yet.</p>
        ) : (
          <ul className="list">
            {habits.map((h) => {
              const { run, total } = streakOf(h.days);
              const done = h.days.includes(t);
              return (
                <li key={h.id}>
                  <button
                    className={"iconbtn" + (done ? " on" : "")}
                    onClick={(e) => {
                      if (!done) celebrate(e.currentTarget);
                      onToggle(h.id);
                    }}
                    aria-pressed={done}
                  >
                    {done ? "done" : "mark"}
                  </button>
                  <span className="grow">
                    <span className="what">{h.name}</span>
                    <span className="when">
                      {run > 0 ? `${run} day run` : total > 0 ? "paused" : "not started"}
                    </span>
                  </span>
                  <span className="count">{total} total</span>
                  <button className="iconbtn" onClick={() => onRemove(h.id)} aria-label={`remove ${h.name}`}>
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="panel">
        
        <h2 className="h">ideas</h2>
        <p className="sub">pick a category, then tap to add.</p>
        <div className="chips">
          {AREAS.map((a) => (
            <button
              key={a.key}
              className={"chip" + (openArea === a.key ? " sel" : "")}
              onClick={() => setOpenArea(openArea === a.key ? null : a.key)}
            >
              {a.name}
            </button>
          ))}
        </div>
        {openArea ? (
          <div className="chips" style={{ marginTop: 12 }}>
            {AREAS.find((a) => a.key === openArea)?.habits.map((h) => {
              const added = existing.has(h.toLowerCase());
              return (
                <button
                  key={h}
                  className={"chip" + (added ? " pos" : "")}
                  disabled={added}
                  onClick={(e) => {
                    celebrate(e.currentTarget);
                    onAdd(h);
                  }}
                >
                  {added ? `${h} ✓` : `+ ${h}`}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
