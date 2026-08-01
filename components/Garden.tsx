"use client";

// The slow garden. It only ever grows — no wilting, no "your plant is dying,"
// no streak to break. Come back after a month and it's where you left it.

const LEAVES = ["🌱", "🌿", "🍃"];

export default function Garden({ started }: { started: number }) {
  if (started === 0) return null;
  const shown = Math.min(started, 40);
  const leaves = Array.from({ length: shown }, (_, i) => LEAVES[i % LEAVES.length]).join("");

  return (
    <div className="garden">
      <span className="leaves" aria-hidden="true">
        {leaves}
      </span>
      <span>
        started: <b>{started}</b>
      </span>
    </div>
  );
}
