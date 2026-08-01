"use client";

import { useState } from "react";

type Step = { title: string; body: string; hint?: string };

const STEPS: Step[] = [
  {
    title: "one small thing at a time",
    body: "budg3 never gives you a list. it gives you a single step you could do in the next two minutes, and that's it. do it, and you get another.",
    hint: "if a step doesn't fit, swap it. that costs you nothing.",
  },
  {
    title: "four ways to get going",
    body: "stuck with no idea where to begin? hit the big button. know exactly what you're avoiding? shrink it. want to pick an area of your life, or start alongside someone? both are there too.",
    hint: "they all live under the start tab.",
  },
  {
    title: "build things that stick",
    body: "habits you choose, and numbers you want to watch. a missed day pauses a run — it never resets it to zero, and nothing here ever turns red.",
    hint: "under build.",
  },
  {
    title: "nothing you do disappears",
    body: "every start is logged and counted. you'll see today's building up as you go, your week on the home screen, and the whole record whenever you want it.",
    hint: "tapped something by accident? undo is right there.",
  },
  {
    title: "that's it",
    body: "no streaks to lose, no notifications nagging you, nothing shared anywhere. it's yours, and you can export or erase all of it any time.",
    hint: "you can replay this from the ? in the corner.",
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
