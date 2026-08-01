"use client";

import { useState } from "react";
import { Wall } from "@/lib/store";
import { allSteps } from "@/lib/shrinker";

/** A miniature of the wall, so you can see its state without opening it. */
function Mini({ wall }: { wall: Wall }) {
  return (
    <span className="mini" aria-hidden="true">
      {wall.bricks.slice(0, 12).map((b) => (
        <i key={b.id} className={"mb " + b.state} />
      ))}
    </span>
  );
}

export default function Walls({
  walls,
  onOpen,
  onAdd,
}: {
  walls: Wall[];
  onOpen: (id: string) => void;
  onAdd: (name: string, steps: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<{ name: string; intro: string; steps: string[] } | null>(
    null
  );

  const standing = walls.filter((w) => w.bricks.some((b) => b.state === "in"));
  const finished = walls.filter((w) => !w.bricks.some((b) => b.state === "in"));

  // Two steps on purpose: you see the bricks budg3 suggests before the wall
  // exists, so it never feels like something was decided for you.
  if (preview) {
    return (
      <div className="panel">
        <p className="eyebrow">{preview.name}</p>
        <h2 className="h">here&apos;s the wall</h2>
        <p className="sub">{preview.intro}</p>
        <ul className="previewbricks">
          {preview.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        <div className="row" style={{ marginTop: 18 }}>
          <button
            className="btn primary"
            onClick={() => {
              onAdd(preview.name, preview.steps);
              setPreview(null);
              setName("");
            }}
          >
            build it
          </button>
          <button className="btn ghost" onClick={() => setPreview(null)}>
            back
          </button>
        </div>
        <p className="note" style={{ margin: "14px 0 0" }}>
          you can change, add or bin any of these once it&apos;s up.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="panel lead">
        <h2 className="h">what are you up against?</h2>
        <p className="sub">
          a task or a way you want to feel. budg3 builds it into a wall you can take apart.
        </p>
        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            const v = name.trim();
            if (!v) return;
            const { intro, steps } = allSteps(v);
            setPreview({ name: v, intro, steps });
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="history essay, feeling happier, my room…"
            aria-label="name your wall"
          />
          <button className="btn primary" type="submit">
            build the wall
          </button>
        </form>
      </div>

      {standing.length > 0 ? (
        <div className="panel flat">
          <h2 className="h">walls you&apos;re on</h2>
          <ul className="list">
            {standing.map((w) => {
              const out = w.bricks.filter((b) => b.state === "down").length;
              return (
                <li key={w.id}>
                  <span className="grow">
                    <span className="what">{w.name}</span>
                    <span className="when">
                      {out} of {w.bricks.length} bricks out
                    </span>
                  </span>
                  <Mini wall={w} />
                  <button className="iconbtn" onClick={() => onOpen(w.id)}>
                    open
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="empty" style={{ paddingTop: 18 }}>
          no walls up yet. name one above and budg3 will break it into bricks.
        </p>
      )}

      {finished.length > 0 ? (
        <div className="panel flat">
          <h2 className="h">walls you&apos;ve taken down</h2>
          <ul className="list">
            {finished.map((w) => (
              <li key={w.id}>
                <span className="grow">
                  <span className="what">{w.name}</span>
                  <span className="when">{w.bricks.length} bricks, all out</span>
                </span>
                <button className="iconbtn" onClick={() => onOpen(w.id)}>
                  look
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
