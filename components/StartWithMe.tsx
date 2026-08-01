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
      <p className="eyebrow">// start with me</p>
      {phase === "idle" && (
        <>
          <h2 className="h">we&apos;ll start together.</h2>
          <p className="sub">
            two minutes, side by side. you don&apos;t have to finish anything — you just have to be
            starting at the same time as someone else.
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
            ok, let&apos;s go
          </button>
        </>
      )}

      {phase === "ready" && (
        <>
          <h2 className="h">okay. ready…</h2>
          <p className="sub">put the thing in front of you.</p>
        </>
      )}

      {phase === "going" && (
        <>
          <h2 className="h">go. i&apos;m right here.</h2>
          <p className="timer">
            {mm}:{ss}
          </p>
          <p className="sub">
            {what.trim() ? `we're on: ${what.trim()}` : "doesn't have to be good. it just has to be started."}
          </p>
          <button className="btn ghost" onClick={stop}>
            stop
          </button>
        </>
      )}

      {phase === "done" && (
        <>
          <h2 className="h">that&apos;s two minutes.</h2>
          <p className="sub">keep going or stop — both completely fine.</p>
          <div className="row">
            <button className="btn primary" onClick={begin}>
              another two
            </button>
            <button className="btn ghost" onClick={stop}>
              i&apos;m good
            </button>
          </div>
        </>
      )}
    </div>
  );
}
