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
        <p className="eyebrow">// habit builder</p>
        <h2 className="h">things you&apos;re building.</h2>
        <p className="sub">
          {habits.length === 0
            ? "pick from below or write your own. small ones stick better than big ones."
            : `${doneToday} of ${habits.length} done today. no pressure on the rest.`}
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
          <p className="empty">nothing here yet. that&apos;s fine — add one if you want one.</p>
        ) : (
          <ul className="list">
            {habits.map((h) => {
              const { run, total } = streakOf(h.days);
              const done = h.days.includes(t);
              return (
                <li key={h.id}>
                  <button
                    className={"iconbtn" + (done ? " on" : "")}
                    onClick={() => {
                      if (!done) celebrate();
                      onToggle(h.id);
                    }}
                    aria-pressed={done}
                  >
                    {done ? "done" : "mark"}
                  </button>
                  <span className="grow">
                    <span className="what">{h.name}</span>
                    <span className="when">
                      {run > 0 ? `${run} day run` : total > 0 ? "paused — pick it up whenever" : "not started yet"}
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
        <p className="eyebrow">// ideas</p>
        <h2 className="h">need somewhere to start?</h2>
        <p className="sub">tap an area, then tap any habit to add it.</p>
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
                  onClick={() => {
                    celebrate();
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
