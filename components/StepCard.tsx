"use client";

import { useState } from "react";
import { celebrate } from "./Celebrate";

/**
 * One step, two buttons. Skipping is free and never punished — it just deals
 * a gentler one, which is exactly what makes people more likely to take one.
 */
export default function StepCard({
  step,
  note,
  onDone,
  onSkip,
  skipLabel = "not feeling it",
}: {
  step: string;
  note?: string;
  onDone: () => void;
  onSkip: () => void;
  skipLabel?: string;
}) {
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <div className="task">
        <p className="win">{done}</p>
      </div>
    );
  }

  return (
    <div className="task">
      {note ? <p className="note">{note}</p> : null}
      <p className="text">{step}</p>
      <div className="row">
        <button
          className="btn primary"
          onClick={() => {
            celebrate();
            onDone();
          }}
        >
          i did it
        </button>
        <button className="btn ghost" onClick={onSkip}>
          {skipLabel}
        </button>
      </div>
    </div>
  );
}
