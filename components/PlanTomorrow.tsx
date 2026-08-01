"use client";

import { useState } from "react";
import { Plan, today } from "@/lib/store";
import { celebrate } from "./Celebrate";

function tomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Wind-down mode kept telling people the smart move was setting tomorrow up,
 * without giving them any way to do it. This is that way.
 *
 * Capped at three deliberately: a list you wrote at midnight and can't face in
 * the morning is worse than no list.
 */
export default function PlanTomorrow({
  plans,
  onAdd,
  onRemove,
}: {
  plans: Plan[];
  onAdd: (text: string, forDay: string) => void;
  onRemove: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const forDay = tomorrowKey();
  const mine = plans.filter((p) => p.forDay === forDay && !p.done);
  const full = mine.length >= 3;

  return (
    <div className="panel">
      <h2 className="h">set tomorrow up</h2>
      <p className="sub">
        {full
          ? "three is plenty. tomorrow-you will thank you."
          : `pick up to three things. they'll be waiting in the morning.`}
      </p>

      {!full ? (
        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            const v = text.trim();
            if (!v) return;
            onAdd(v, forDay);
            setText("");
          }}
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="one thing for tomorrow…"
            aria-label="a plan for tomorrow"
          />
          <button className="btn primary" type="submit">
            add
          </button>
        </form>
      ) : null}

      {mine.length === 0 ? (
        <p className="empty">nothing set yet.</p>
      ) : (
        <ul className="list">
          {mine.map((p) => (
            <li key={p.id}>
              <span className="grow">
                <span className="what">{p.text}</span>
              </span>
              <button className="iconbtn" onClick={() => onRemove(p.id)} aria-label={`remove ${p.text}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** What you lined up yesterday, waiting for you now. */
export function TodaysPlans({
  plans,
  onComplete,
  onRemove,
}: {
  plans: Plan[];
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const t = today();
  const mine = plans.filter((p) => p.forDay === t && !p.done);
  if (mine.length === 0) return null;

  return (
    <div className="panel">
      <h2 className="h">you lined these up</h2>
      <p className="sub">past-you picked these for today.</p>
      <ul className="list">
        {mine.map((p) => (
          <li key={p.id}>
            <button
              className="iconbtn"
              onClick={(e) => {
                celebrate(e.currentTarget);
                onComplete(p.id);
              }}
            >
              mark
            </button>
            <span className="grow">
              <span className="what">{p.text}</span>
            </span>
            <button className="iconbtn" onClick={() => onRemove(p.id)} aria-label={`remove ${p.text}`}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
