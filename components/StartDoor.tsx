"use client";

import { useState } from "react";
import { FEELINGS, POSITIVE_POOLS, Pool, pickTask, pickWin } from "@/lib/feelings";
import { celebrate } from "./Celebrate";

type Phase =
  | { k: "idle" }
  | { k: "counting"; task: string; left: number }
  | { k: "step"; task: string; pool: Pool; feeling?: string; gentler: boolean }
  | { k: "won"; line: string; pool: Pool; feeling?: string };

/**
 * Doors one and two: the 10-second start for when choosing is already too
 * much, and the feeling menu for when there's enough bandwidth to name it.
 */
export default function StartDoor({
  onStarted,
}: {
  onStarted: (text: string, feeling?: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ k: "idle" });
  const [openMenu, setOpenMenu] = useState(false);

  function quickStart() {
    // No choosing. One thing, ten seconds, go.
    const task = pickTask("steady");
    setPhase({ k: "counting", task, left: 10 });
    const iv = setInterval(() => {
      setPhase((p) => {
        if (p.k !== "counting") {
          clearInterval(iv);
          return p;
        }
        if (p.left <= 1) {
          clearInterval(iv);
          return { k: "step", task: p.task, pool: "steady", gentler: false };
        }
        return { ...p, left: p.left - 1 };
      });
    }, 1000);
  }

  function chooseFeeling(word: string, pool: Pool) {
    setOpenMenu(false);
    setPhase({ k: "step", task: pickTask(pool), pool, feeling: word, gentler: false });
  }

  function done(task: string, pool: Pool, feeling?: string) {
    onStarted(task, feeling);
    setPhase({ k: "won", line: pickWin(), pool, feeling });
  }

  if (phase.k === "counting") {
    return (
      <div className="panel">
        
        <h2 className="h">{phase.task}</h2>
        <p className="timer">{phase.left}</p>
        <div className="row">
          <button
            className="btn primary"
            onClick={() => setPhase({ k: "step", task: phase.task, pool: "steady", gentler: false })}
          >
            start now
          </button>
          <button className="btn ghost" onClick={() => setPhase({ k: "idle" })}>
            not this one
          </button>
        </div>
      </div>
    );
  }

  if (phase.k === "step") {
    return (
      <div className="panel">
        <p className="eyebrow">{phase.feeling ? phase.feeling : "your first step"}</p>
        <div className="task">
          {phase.gentler ? <p className="note">here's an easier one.</p> : null}
          <p className="text">{phase.task}</p>
          <div className="row">
            <button
              className="btn primary"
              onClick={(e) => {
                celebrate(e.currentTarget);
                done(phase.task, phase.pool, phase.feeling);
              }}
            >
              i did it
            </button>
            <button
              className="btn ghost"
              onClick={() =>
                setPhase({
                  k: "step",
                  task: pickTask(phase.pool, phase.task),
                  pool: phase.pool,
                  feeling: phase.feeling,
                  gentler: true,
                })
              }
            >
              something else
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase.k === "won") {
    return (
      <div className="panel">
        <div className="task">
          <p className="win">{phase.line}</p>
          <button
            className="link"
            onClick={() =>
              setPhase({
                k: "step",
                task: pickTask(phase.pool),
                pool: phase.pool,
                feeling: phase.feeling,
                gentler: false,
              })
            }
          >
            another one →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 className="h">start something.</h2>
      <p className="sub">one small thing to get you moving.</p>

      <button className="btn primary big" onClick={quickStart}>
        give me something to do
      </button>

      <div style={{ marginTop: 14 }}>
        {!openMenu ? (
          <button className="link" onClick={() => setOpenMenu(true)}>
            pick how you're feeling instead →
          </button>
        ) : (
          <>
            <p className="sub" style={{ margin: "4px 0 12px" }}>
              how are you feeling right now?
            </p>
            <div className="chips">
              {FEELINGS.map((f) => (
                <button
                  key={f.word}
                  className={
                    "chip" +
                    (f.pool === "unnamed" ? " unn" : POSITIVE_POOLS.includes(f.pool) ? " pos" : "")
                  }
                  onClick={() => chooseFeeling(f.word, f.pool)}
                >
                  {f.word}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
