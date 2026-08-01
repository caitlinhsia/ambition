"use client";

import { useState } from "react";
import { shrink } from "@/lib/shrinker";
import { pickAgain, pickWin } from "@/lib/lines";
import { celebrate } from "./Celebrate";

/**
 * Door three. Name the thing you want to tackle and get one small first move.
 *
 * Two counters on purpose: `cursor` is which step you're looking at, `done` is
 * how many you've actually completed. Browsing for a step that fits must not
 * cost you progress through the list.
 */
export default function Shrinker({ onStarted }: { onStarted: (text: string) => void }) {
  const [thing, setThing] = useState("");
  const [target, setTarget] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [done, setDone] = useState(0);
  const [won, setWon] = useState<string | null>(null);
  const [again, setAgain] = useState(pickAgain);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = thing.trim();
    if (!v) return;
    setTarget(v);
    setCursor(0);
    setDone(0);
    setWon(null);
  }

  function reset() {
    setTarget(null);
    setThing("");
    setCursor(0);
    setDone(0);
    setWon(null);
  }

  if (target) {
    const { intro, step, total } = shrink(target, cursor);
    const more = done < total;

    return (
      <div className="panel">
        <p className="eyebrow">{target}</p>

        {won ? (
          <div className="task">
            <p className="win">{won}</p>
            <p className="gain">
              <span className="plus">+1</span> logged — it&apos;s on your record now.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              {more ? (
                <button
                  className="btn primary"
                  onClick={() => {
                    setCursor((c) => c + 1);
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
              {more
                ? `${done} of ${total} done on this. stop here or keep the momentum.`
                : `that's all ${total} steps for this one. nicely done.`}
            </p>
          </div>
        ) : (
          <div className="task">
            <p className="note">
              {done === 0 ? intro : `step ${Math.min(done + 1, total)} of ${total}.`}
            </p>
            <p className="text">{step}</p>
            <div className="row">
              <button
                className="btn primary"
                onClick={(e) => {
                  celebrate(e.currentTarget);
                  onStarted(`${target} — ${step}`);
                  setDone((d) => d + 1);
                  setWon(pickWin());
                  setAgain(pickAgain());
                }}
              >
                i did it
              </button>
              {/* Only rotates which step you're looking at — progress is
                  tracked separately, so browsing costs you nothing. */}
              <button className="btn ghost" onClick={() => setCursor((c) => c + 1)}>
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
      <p className="sub">name it and get your first move — not the whole plan.</p>
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
