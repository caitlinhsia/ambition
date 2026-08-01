"use client";

import { dayLetters, habitWeek } from "@/lib/history";
import { Habit } from "@/lib/store";

/**
 * Seven boxes, oldest to today. A missed day is simply an unfilled box — no
 * red, no cross, nothing that reads as a failure. The point is to show that
 * the habit exists across days, not to grade the week.
 */
export default function WeekRow({ habit, showLetters = false }: { habit: Habit; showLetters?: boolean }) {
  const week = habitWeek(habit, 7);
  const letters = dayLetters(week.map((w) => w.day));

  return (
    <div className="weekrow" aria-label={`last 7 days of ${habit.name}`}>
      {week.map((w, i) => (
        <span key={w.day} className="wcell">
          {showLetters ? <span className="wl">{letters[i]}</span> : null}
          <span
            className={"wbox" + (w.done ? " on" : "") + (i === week.length - 1 ? " today" : "")}
            title={w.day}
          />
        </span>
      ))}
    </div>
  );
}
