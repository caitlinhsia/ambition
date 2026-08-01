"use client";

/**
 * Every section looked identical — same panel, same mono heading — so you
 * could never tell where you were. This gives each one a proper title and a
 * course of bricks under it, which is also the only place the motto shows up
 * as something you see rather than read.
 */
export default function SectionHeader({
  title,
  blurb,
  count,
}: {
  title: string;
  blurb: string;
  /** How many bricks to light in the course. Purely decorative. */
  count?: number;
}) {
  const lit = Math.max(0, Math.min(count ?? 0, 8));
  return (
    <header className="sechead">
      <h2 className="sectitle">{title}</h2>
      <p className="secblurb">{blurb}</p>
      <div className="course" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={"brick" + (i < lit ? " lit" : "")} />
        ))}
      </div>
    </header>
  );
}
