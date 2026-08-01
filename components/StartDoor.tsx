"use client";

import { useEffect, useRef, useState } from "react";
import { FEELINGS, POSITIVE_POOLS, Pool, pickTask } from "@/lib/feelings";
import { pickAgain, pickCountdown, pickIdleSub, pickSwapped, pickWin } from "@/lib/lines";
import { celebrate } from "./Celebrate";

type Phase =
  | { k: "idle" }
  | { k: "counting"; task: string; left: number; prompt: string }
  | { k: "step"; task: string; pool: Pool; feeling?: string; swapNote: string | null }
  | { k: "won"; line: string; again: string; pool: Pool; feeling?: string };

/**
 * Doors one and two: the ten second start for when choosing is the blocker,
 * and the feeling menu for when there's enough bandwidth to name it.
 */
export default function StartDoor({
  onStarted,
}: {
  onStarted: (text: string, feeling?: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ k: "idle" });
  const [openMenu, setOpenMenu] = useState(false);
  const [idleSub] = useState(pickIdleSub);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopTimer() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }

  // Never leave an interval running behind us.
  useEffect(() => stopTimer, []);

  /** Start (or restart) the countdown on a given task. */
  function countDown(task: string) {
    stopTimer();
    setPhase({ k: "counting", task, left: 10, prompt: pickCountdown() });
    timer.current = setInterval(() => {
      setPhase((p) => {
        if (p.k !== "counting") return p;
        if (p.left <= 1) {
          stopTimer();
          return { k: "step", task: p.task, pool: "steady", swapNote: null };
        }
        return { ...p, left: p.left - 1 };
      });
    }, 1000);
  }

  function chooseFeeling(word: string, pool: Pool) {
    setOpenMenu(false);
    setPhase({ k: "step", task: pickTask(pool), pool, feeling: word, swapNote: null });
  }

  function done(task: string, pool: Pool, feeling?: string) {
    onStarted(task, feeling);
    setPhase({ k: "won", line: pickWin(), again: pickAgain(), pool, feeling });
  }

  if (phase.k === "counting") {
    return (
      <div className="panel">
        <p className="eyebrow">{phase.prompt}</p>
        <h2 className="h">{phase.task}</h2>
        <p className="timer">{phase.left}</p>
        <div className="row">
          <button
            className="btn primary"
            onClick={() => {
              stopTimer();
              setPhase({ k: "step", task: phase.task, pool: "steady", swapNote: null });
            }}
          >
            go now
          </button>
          {/* Swap deals a different task and restarts the clock — it must not
              drop you back to the start screen. */}
          <button className="btn ghost" onClick={() => countDown(pickTask("steady", phase.task))}>
            swap it
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              stopTimer();
              setPhase({ k: "idle" });
            }}
          >
            back
          </button>
        </div>
      </div>
    );
  }

  if (phase.k === "step") {
    return (
      <div className="panel">
        <p className="eyebrow">{phase.feeling ? phase.feeling : "your move"}</p>
        <div className="task">
          {phase.swapNote ? <p className="note">{phase.swapNote}</p> : null}
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
                  swapNote: pickSwapped(phase.swapNote),
                })
              }
            >
              swap it
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
                swapNote: null,
              })
            }
          >
            {phase.again}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 className="h">let&apos;s get moving.</h2>
      <p className="sub">{idleSub}</p>

      <button className="btn primary big" onClick={() => countDown(pickTask("steady"))}>
        this is the start
      </button>

      <div style={{ marginTop: 14 }}>
        {!openMenu ? (
          <button className="link" onClick={() => setOpenMenu(true)}>
            pick how you&apos;re feeling instead →
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
