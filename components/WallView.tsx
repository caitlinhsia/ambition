"use client";

import { useState } from "react";
import { Brick, Wall } from "@/lib/store";
import { pickWin } from "@/lib/lines";
import { celebrate } from "./Celebrate";

/**
 * The wall itself — the thing you're facing, laid out as brickwork with the
 * name on a plaque in the middle.
 *
 * Tapping a brick selects it rather than completing it, so nothing is ever
 * done by accident and the three things you can do to a brick are all equally
 * reachable: knock it down, change it, or move it out of the way.
 */
export default function WallView({
  wall,
  onKnock,
  onSetState,
  onEdit,
  onRemoveBrick,
  onAddBrick,
  onRemoveWall,
  onBack,
}: {
  wall: Wall;
  onKnock: (brickId: string) => void;
  onSetState: (brickId: string, state: Brick["state"]) => void;
  onEdit: (brickId: string, text: string) => void;
  onRemoveBrick: (brickId: string) => void;
  onAddBrick: (text: string) => void;
  onRemoveWall: () => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState("");
  const [justWon, setJustWon] = useState<string | null>(null);

  const standing = wall.bricks.filter((b) => b.state === "in");
  /** Still in the wall — aside bricks are moved over, not removed. */
  const upright = wall.bricks.filter((b) => b.state !== "down");
  const aside = wall.bricks.filter((b) => b.state === "aside");
  const down = wall.bricks.filter((b) => b.state === "down");
  const isDown = standing.length === 0 && wall.bricks.length > 0;
  const sel = wall.bricks.find((b) => b.id === selected) ?? null;

  function knock(b: Brick, el: HTMLElement) {
    celebrate(el);
    onKnock(b.id);
    setSelected(null);
    setJustWon(pickWin());
  }

  function renderCourse(list: Brick[]) {
    if (list.length === 0) return null;
    return (
      <div className="bricks">
        {list.map((b, i) => (
          <button
            key={b.id}
            className={
              "wbrick " + b.state + (selected === b.id ? " sel" : "") + (i % 3 === 0 ? " wide" : "")
            }
            onClick={() => {
              setSelected(selected === b.id ? null : b.id);
              setEditing(null);
              setJustWon(null);
            }}
            title={b.text}
          >
            <span className="wbtext">{b.text}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="panel">
        <div className="wallhead">
          <button className="link" style={{ marginTop: 0 }} onClick={onBack}>
            ← all walls
          </button>
          <span className="wallcount">
            {down.length} of {wall.bricks.length} out
          </span>
        </div>

        {/* The name sits in its own course rather than floating over the
            bricks, so it never covers what a brick says. */}
        <div className="wall" aria-label={`the ${wall.name} wall`}>
          {renderCourse(upright.slice(0, Math.ceil(upright.length / 2)))}

          <div className="plaque">
            <span className="plabel">{isDown ? "wall's down" : "the wall"}</span>
            <span className="pname">{wall.name}</span>
          </div>

          {renderCourse(upright.slice(Math.ceil(upright.length / 2)))}

          {isDown ? <p className="wallgone">nothing left standing.</p> : null}
        </div>

        {/* Knocked-out bricks leave the wall and land here, so you watch the
            wall thin and the heap grow at the same time. */}
        {down.length > 0 ? (
          <div className="rubble">
            <span className="rlabel">
              {down.length} {down.length === 1 ? "brick" : "bricks"} out
            </span>
            <div className="heap">
              {down.map((b, i) => (
                <button
                  key={b.id}
                  className={"chip-brick" + (selected === b.id ? " sel" : "")}
                  style={{ rotate: `${((i * 37) % 9) - 4}deg` }}
                  onClick={() => {
                    setSelected(selected === b.id ? null : b.id);
                    setEditing(null);
                    setJustWon(null);
                  }}
                  title={b.text}
                >
                  {b.text}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {isDown ? (
          <div className="task" style={{ marginTop: 18 }}>
            <p className="win">every brick out. that wall&apos;s gone.</p>
            <p className="gain">
              <span className="plus">{wall.bricks.length}</span> bricks, one at a time.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn ghost" onClick={onBack}>
                pick another wall
              </button>
              <button className="btn ghost" onClick={onRemoveWall}>
                clear this one
              </button>
            </div>
          </div>
        ) : justWon ? (
          <p className="wallwin">{justWon}</p>
        ) : null}

        {/* what you can do to the selected brick */}
        {sel ? (
          <div className="brickpanel">
            {editing === sel.id ? (
              <form
                className="field"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = draft.trim();
                  if (v) onEdit(sel.id, v);
                  setEditing(null);
                }}
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="change this brick"
                  autoFocus
                />
                <button className="btn primary" type="submit">
                  save
                </button>
                <button className="btn ghost" type="button" onClick={() => setEditing(null)}>
                  cancel
                </button>
              </form>
            ) : (
              <>
                <p className="brickname">{sel.text}</p>
                <div className="row">
                  {sel.state !== "down" ? (
                    <button
                      className="btn primary"
                      onClick={(e) => knock(sel, e.currentTarget)}
                    >
                      knock it out
                    </button>
                  ) : (
                    <button
                      className="btn ghost"
                      onClick={() => {
                        onSetState(sel.id, "in");
                        setSelected(null);
                      }}
                    >
                      put it back
                    </button>
                  )}
                  <button
                    className="btn ghost"
                    onClick={() => {
                      setEditing(sel.id);
                      setDraft(sel.text);
                    }}
                  >
                    change it
                  </button>
                  {sel.state === "in" ? (
                    <button
                      className="btn ghost"
                      onClick={() => {
                        onSetState(sel.id, "aside");
                        setSelected(null);
                      }}
                    >
                      move it aside
                    </button>
                  ) : null}
                  {sel.state === "aside" ? (
                    <button
                      className="btn ghost"
                      onClick={() => {
                        onSetState(sel.id, "in");
                        setSelected(null);
                      }}
                    >
                      back in the wall
                    </button>
                  ) : null}
                  <button
                    className="btn ghost"
                    onClick={() => {
                      onRemoveBrick(sel.id);
                      setSelected(null);
                    }}
                  >
                    bin it
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="note" style={{ margin: "16px 0 0" }}>
            tap any brick to knock it out, change it, or move it out of the way.
          </p>
        )}
      </div>

      <div className="panel flat">
        <h2 className="h">add a brick</h2>
        <p className="sub">
          {aside.length > 0
            ? `${aside.length} moved aside. they're not gone, just not now.`
            : "spotted a smaller piece? put it in."}
        </p>
        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            const v = adding.trim();
            if (!v) return;
            onAddBrick(v);
            setAdding("");
          }}
        >
          <input
            type="text"
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            placeholder="one small piece of it…"
            aria-label="new brick"
          />
          <button className="btn primary" type="submit">
            add
          </button>
        </form>
      </div>
    </>
  );
}
