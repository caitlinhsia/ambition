"use client";

import { useState } from "react";
import { AREAS, Area, pickStart } from "@/lib/areas";
import { pickAgain, pickWin } from "@/lib/lines";
import { celebrate } from "./Celebrate";

/**
 * The "what do you want to move on?" door. Deliberately goal-shaped rather
 * than mood-shaped — most people arrive wanting to get something done, not
 * wanting to talk about how they feel.
 */
export default function AreaDoor({ onStarted }: { onStarted: (text: string) => void }) {
  const [area, setArea] = useState<Area | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [won, setWon] = useState<string | null>(null);
  const [again, setAgain] = useState(pickAgain);

  function choose(a: Area) {
    setArea(a);
    setStep(pickStart(a));
    setWon(null);
  }

  if (area && step) {
    return (
      <div className="panel">
        <p className="eyebrow">{area.name}</p>
        {won ? (
          <div className="task">
            <p className="win">{won}</p>
            <p className="gain"><span className="plus">+1</span> logged — it's on your record now.</p>
            <div className="row" style={{ marginTop: 14 }}>
              <button
                className="btn primary"
                onClick={() => {
                  setStep(pickStart(area, step));
                  setWon(null);
                }}
              >
                {again}
              </button>
              <button className="btn ghost" onClick={() => setArea(null)}>
                different area
              </button>
            </div>
          </div>
        ) : (
          <div className="task">
            <p className="text">{step}</p>
            <div className="row">
              <button
                className="btn primary"
                onClick={(e) => {
                  celebrate(e.currentTarget);
                  onStarted(step);
                  setWon(pickWin());
                  setAgain(pickAgain());
                }}
              >
                i did it
              </button>
              <button className="btn ghost" onClick={() => setStep(pickStart(area, step))}>
                different step
              </button>
              <button className="btn ghost" onClick={() => setArea(null)}>
                back
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="panel">
      
      <h2 className="h">what are you taking on?</h2>
      <p className="sub">pick a lane and get your first move.</p>
      <div className="areas">
        {AREAS.map((a) => (
          <button key={a.key} className="area" onClick={() => choose(a)}>
            <span className="an">{a.name}</span>
            <span className="ab">{a.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
