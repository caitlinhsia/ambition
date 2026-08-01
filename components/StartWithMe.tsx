"use client";

import { useEffect, useRef, useState } from "react";
import { celebrate } from "./Celebrate";

/**
 * Body doubling, stripped to its mechanism: the felt sense of not starting
 * alone. No camera, no account, no real-time anything — just "ready… start"
 * and two minutes of company.
 */
export default function StartWithMe({ onStarted }: { onStarted: (text: string) => void }) {
  const [phase, setPhase] = useState<"idle" | "ready" | "going" | "done">("idle");
  const [left, setLeft] = useState(120);
  const [what, setWhat] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function begin() {
    setPhase("ready");
    setTimeout(() => {
      setPhase("going");
      setLeft(120);
      timer.current = setInterval(() => {
        setLeft((l) => {
          if (l <= 1) {
            if (timer.current) clearInterval(timer.current);
            setPhase("done");
            celebrate();
            onStarted(what.trim() ? `2 minutes on: ${what.trim()}` : "2 minutes of starting");
            return 0;
          }
          return l - 1;
        });
      }, 1000);
    }, 1800);
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    setPhase("idle");
    setLeft(120);
  }

  const mm = String(Math.floor(left / 60)).padStart(1, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="panel">
      
      {phase === "idle" && (
        <>
          <h2 className="h">two minutes, together.</h2>
          <p className="sub">
            a two minute timer. you don't have to finish anything, just start.
          </p>
          <div className="field" style={{ marginBottom: 12 }}>
            <input
              type="text"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              placeholder="what are we starting? (optional)"
              aria-label="what are we starting"
            />
          </div>
          <button className="btn primary big" onClick={begin}>
            start the timer
          </button>
        </>
      )}

      {phase === "ready" && (
        <>
          <h2 className="h">ready…</h2>
          <p className="sub">put the thing in front of you.</p>
        </>
      )}

      {phase === "going" && (
        <>
          <h2 className="h">go.</h2>
          <p className="timer">
            {mm}:{ss}
          </p>
          <p className="sub">
            {what.trim() ? `we're on: ${what.trim()}` : "you're on the clock."}
          </p>
          <button className="btn ghost" onClick={stop}>
            stop
          </button>
        </>
      )}

      {phase === "done" && (
        <>
          <h2 className="h">two minutes done.</h2>
          <p className="sub">keep going, or stop here.</p>
          <div className="row">
            <button className="btn primary" onClick={begin}>
              two more minutes
            </button>
            <button className="btn ghost" onClick={stop}>
              done
            </button>
          </div>
        </>
      )}
    </div>
  );
}
