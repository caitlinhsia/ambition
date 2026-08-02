"use client";

import { useState } from "react";

type Step = { title: string; body: string; hint?: string };

const STEPS: Step[] = [
  {
    title: "name what's in your way",
    body: "an essay, the gym, a message you owe, or a way you want to feel. type it in and budg3 turns it into a wall — the whole thing broken into bricks small enough to actually lift.",
    hint: "you see the bricks before the wall goes up. nothing is decided for you.",
  },
  {
    title: "take one brick out",
    body: "tap any brick in the wall and you can knock it out, reword it so it sounds like you, or move it out of the way for now. moving one aside isn't failing — it's still there when you want it.",
    hint: "knocked-out bricks drop to a pile under the wall. the pile only grows.",
  },
  {
    title: "when naming it is too much",
    body: "some days you can't even pick. hit \"one brick\" and budg3 just hands you something small — a countdown, a feeling to pick from, or two minutes side by side.",
    hint: "no wall required.",
  },
  {
    title: "build things that stick",
    body: "habits you choose and numbers you want to watch. a missed day pauses a run — it never resets it to zero, and nothing here ever turns red.",
    hint: "under build.",
  },
  {
    title: "nothing you do disappears",
    body: "every brick is counted. you'll see today's building as you go, your week and your whole record under \"you\", and no streak you can lose.",
    hint: "tapped something by accident? undo is right there. replay this from the ? any time.",
  },
];

export default function Tutorial({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div className="tut-wrap" role="dialog" aria-label="how budg3 works">
      <div className="tut">
        <div className="tut-dots" aria-hidden="true">
          {STEPS.map((_, n) => (
            <span key={n} className={"tdot" + (n === i ? " on" : n < i ? " past" : "")} />
          ))}
        </div>

        <p className="eyebrow">
          {i + 1} of {STEPS.length}
        </p>
        <h2 className="h">{step.title}</h2>
        <p className="tut-body">{step.body}</p>
        {step.hint ? <p className="note">{step.hint}</p> : null}

        <div className="row" style={{ marginTop: 20 }}>
          {last ? (
            <button className="btn primary" onClick={onDone}>
              let&apos;s go
            </button>
          ) : (
            <button className="btn primary" onClick={() => setI(i + 1)}>
              next
            </button>
          )}
          {i > 0 ? (
            <button className="btn ghost" onClick={() => setI(i - 1)}>
              back
            </button>
          ) : null}
          {!last ? (
            <button className="btn ghost" onClick={onDone}>
              skip
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
