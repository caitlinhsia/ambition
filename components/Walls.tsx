"use client";

import { useState } from "react";
import { Wall } from "@/lib/store";
import { allSteps } from "@/lib/shrinker";
import { StartingType, shapeWall } from "@/lib/quiz";

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
  type,
  onOpen,
  onAdd,
}: {
  walls: Wall[];
  type?: StartingType | null;
  onOpen: (id: string) => void;
  onAdd: (name: string, steps: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<{
    name: string;
    intro: string;
    steps: string[];
    note: string | null;
    known: boolean;
  } | null>(null);
  const [own, setOwn] = useState("");
  const [mine, setMine] = useState<string[]>([]);

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
          {mine.map((m, i) => (
            <li key={`m${i}`} className="ownbrick">
              {m}
              <button
                className="undo"
                onClick={() => setMine(mine.filter((_, n) => n !== i))}
                aria-label="remove"
              >
                remove
              </button>
            </li>
          ))}
          {preview.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        {/* When budg3 doesn't recognise the thing, say so rather than
            pretending the generic bricks were written for it. */}
        <p className="note" style={{ margin: "14px 0 8px" }}>
          {preview.known
            ? "know it better than we do? add your own bricks too."
            : "these are the general ones — budg3 doesn't know this thing specifically. your own will be better."}
        </p>
        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            const v = own.trim();
            if (!v) return;
            setMine([...mine, v]);
            setOwn("");
          }}
        >
          <input
            type="text"
            value={own}
            onChange={(e) => setOwn(e.target.value)}
            placeholder="a brick in your own words…"
            aria-label="your own brick"
          />
          <button className="btn ghost" type="submit">
            add brick
          </button>
        </form>
        <div className="row" style={{ marginTop: 18 }}>
          <button
            className="btn primary"
            onClick={() => {
              onAdd(preview.name, [...mine, ...preview.steps]);
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
        {preview.note ? <p className="typecue">{preview.note}</p> : null}
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
            const { intro, steps, known } = allSteps(v);
            const shaped = shapeWall(steps, type);
            setMine([]);
            setPreview({ name: v, intro, steps: shaped.steps, note: shaped.note, known });
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
