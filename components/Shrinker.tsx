"use client";

import { useState } from "react";
import { shrink } from "@/lib/shrinker";
import { pickAgain, pickWin } from "@/lib/lines";
import { celebrate } from "./Celebrate";

/**
 * Door three. Type the thing you're dreading and get one stupidly small first
 * move. It never shows you step two — only the next stair, and only if you
 * ask for it. What you type stays on your device.
 */
export default function Shrinker({ onStarted }: { onStarted: (text: string) => void }) {
  const [thing, setThing] = useState("");
  const [target, setTarget] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [won, setWon] = useState<string | null>(null);
  const [again, setAgain] = useState(pickAgain);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = thing.trim();
    if (!v) return;
    setTarget(v);
    setStepIndex(0);
    setWon(null);
  }

  function reset() {
    setTarget(null);
    setThing("");
    setStepIndex(0);
    setWon(null);
  }

  if (target) {
    const { intro, step, more } = shrink(target, stepIndex);
    return (
      <div className="panel">
        <p className="eyebrow">{target}</p>
        {won ? (
          <div className="task">
            <p className="win">{won}</p>
            <div className="row" style={{ marginTop: 14 }}>
              {more ? (
                <button
                  className="btn primary"
                  onClick={() => {
                    setStepIndex((i) => i + 1);
                    setWon(null);
                  }}
                >
                  {again}
                </button>
              ) : null}
              <button className="btn ghost" onClick={reset}>
                something else
              </button>
            </div>
            <p className="note" style={{ margin: "12px 0 0" }}>
              stop here or keep the momentum.
            </p>
          </div>
        ) : (
          <div className="task">
            <p className="note">{intro}</p>
            <p className="text">{step}</p>
            <div className="row">
              <button
                className="btn primary"
                onClick={(e) => {
                  celebrate(e.currentTarget);
                  onStarted(`${target} — ${step}`);
                  setWon(pickWin());
                  setAgain(pickAgain());
                }}
              >
                i did it
              </button>
              <button className="btn ghost" onClick={() => setStepIndex((i) => i + 1)}>
                different step
              </button>
              <button className="btn ghost" onClick={reset}>
                start over
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="panel">
      
      <h2 className="h">what do you want to tackle?</h2>
      <p className="sub">
        name it and get your first move — not the whole plan.
      </p>
      <form className="field" onSubmit={submit}>
        <input
          type="text"
          value={thing}
          onChange={(e) => setThing(e.target.value)}
          placeholder="history essay, text mom back, the dishes…"
          aria-label="the thing you're avoiding"
        />
        <button className="btn primary" type="submit">
          break it down
        </button>
      </form>
      <p className="note" style={{ margin: "12px 0 0" }}>
        only you can see this.
      </p>
    </div>
  );
}
