"use client";

import { useState } from "react";
import { shrink } from "@/lib/shrinker";
import { pickWin } from "@/lib/feelings";
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
    const { sympathy, step, more } = shrink(target, stepIndex);
    return (
      <div className="panel">
        <p className="eyebrow">// the thing: {target}</p>
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
                  what&apos;s next?
                </button>
              ) : null}
              <button className="btn ghost" onClick={reset}>
                something else
              </button>
            </div>
            <p className="note" style={{ margin: "12px 0 0" }}>
              you don&apos;t have to keep going. stopping here is a win too.
            </p>
          </div>
        ) : (
          <div className="task">
            <p className="note">{sympathy}</p>
            <p className="text">{step}</p>
            <div className="row">
              <button
                className="btn primary"
                onClick={() => {
                  celebrate();
                  onStarted(`${target} — ${step}`);
                  setWon(pickWin());
                }}
              >
                i did it
              </button>
              <button className="btn ghost" onClick={() => setStepIndex((i) => i + 1)}>
                give me a different one
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
      <p className="eyebrow">// the shrinker</p>
      <h2 className="h">what are you avoiding?</h2>
      <p className="sub">
        type it in. budg3 shrinks it down to one first move — and never shows you the whole staircase.
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
          shrink it
        </button>
      </form>
      <p className="note" style={{ margin: "12px 0 0" }}>
        stays on your device. nobody sees this but you.
      </p>
    </div>
  );
}
