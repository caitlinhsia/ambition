"use client";

import { useState } from "react";
import { allSteps } from "@/lib/shrinker";
import { celebrate } from "./Celebrate";

const EXAMPLES = ["history essay", "my room", "feeling happier", "getting fit", "making friends"];

/**
 * A working wall on the landing page.
 *
 * Reading "brick by brick" doesn't explain anything — knocking a brick out
 * does. Nothing here is stored; it exists purely so a stranger understands
 * the idea before being asked for an email.
 */
export default function DemoWall({ onSignUp }: { onSignUp: () => void }) {
  const [name, setName] = useState("");
  const [built, setBuilt] = useState<{ name: string; intro: string } | null>(null);
  const [bricks, setBricks] = useState<{ text: string; down: boolean }[]>([]);

  function build(thing: string) {
    const v = thing.trim();
    if (!v) return;
    const { intro, steps } = allSteps(v);
    setBuilt({ name: v, intro });
    setBricks(steps.map((text) => ({ text, down: false })));
  }

  const out = bricks.filter((b) => b.down).length;
  const allOut = bricks.length > 0 && out === bricks.length;

  if (!built) {
    return (
      <div className="demopanel">
        <p className="eyebrow">try it — nothing gets saved</p>
        <h2 className="h">what&apos;s in your way?</h2>
        <p className="sub">type anything, or pick one.</p>
        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            build(name);
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="the thing you keep not doing…"
            aria-label="try a wall"
          />
          <button className="btn primary" type="submit">
            build it
          </button>
        </form>
        <div className="chips" style={{ marginTop: 12 }}>
          {EXAMPLES.map((e) => (
            <button key={e} className="chip" onClick={() => build(e)}>
              {e}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="demopanel">
      <div className="wallhead">
        <button
          className="link"
          style={{ marginTop: 0 }}
          onClick={() => {
            setBuilt(null);
            setBricks([]);
            setName("");
          }}
        >
          ← try another
        </button>
        <span className="wallcount">
          {out} of {bricks.length} out
        </span>
      </div>

      <div className="wall">
        <div className="bricks">
          {bricks
            .filter((b) => !b.down)
            .slice(0, Math.ceil(bricks.filter((b) => !b.down).length / 2))
            .map((b) => (
              <button
                key={b.text}
                className="wbrick in"
                onClick={(e) => {
                  celebrate(e.currentTarget);
                  setBricks((prev) =>
                    prev.map((x) => (x.text === b.text ? { ...x, down: true } : x))
                  );
                }}
              >
                <span className="wbtext">{b.text}</span>
              </button>
            ))}
        </div>

        <div className="plaque">
          <span className="plabel">{allOut ? "wall's down" : "the wall"}</span>
          <span className="pname">{built.name}</span>
        </div>

        <div className="bricks">
          {bricks
            .filter((b) => !b.down)
            .slice(Math.ceil(bricks.filter((b) => !b.down).length / 2))
            .map((b) => (
              <button
                key={b.text}
                className="wbrick in"
                onClick={(e) => {
                  celebrate(e.currentTarget);
                  setBricks((prev) =>
                    prev.map((x) => (x.text === b.text ? { ...x, down: true } : x))
                  );
                }}
              >
                <span className="wbtext">{b.text}</span>
              </button>
            ))}
        </div>

        {allOut ? <p className="wallgone">nothing left standing.</p> : null}
      </div>

      {out > 0 ? (
        <div className="rubble">
          <span className="rlabel">
            {out} {out === 1 ? "brick" : "bricks"} out
          </span>
          <div className="heap">
            {bricks
              .filter((b) => b.down)
              .map((b, i) => (
                <span
                  key={b.text}
                  className="chip-brick"
                  style={{ rotate: `${((i * 37) % 9) - 4}deg` }}
                >
                  {b.text}
                </span>
              ))}
          </div>
        </div>
      ) : null}

      <p className="note" style={{ margin: "16px 0 0" }}>
        {allOut
          ? "that's the whole idea. nothing about that was hard."
          : out > 0
          ? "keep going, or that's the idea."
          : "tap a brick to knock it out."}
      </p>

      {out > 0 ? (
        <button className="btn primary big-cta" style={{ marginTop: 14 }} onClick={onSignUp}>
          do that with your actual walls
        </button>
      ) : null}
    </div>
  );
}
