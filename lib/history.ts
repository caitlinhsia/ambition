// Everything about looking backwards. The app stores habit days and tracker
// counts keyed by date already — this turns that into something you can see.

import { Habit, Receipt, Tracker } from "./store";

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** The last n dates ending today, oldest first. */
export function lastDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(dayKey(x));
  }
  return out;
}

/** Single letter day labels for a run of dates. */
export function dayLetters(days: string[]): string[] {
  return days.map((k) => ["s", "m", "t", "w", "t", "f", "s"][new Date(k + "T12:00:00").getDay()]);
}

/** Which of the last n days this habit was done. */
export function habitWeek(habit: Habit, n = 7): { day: string; done: boolean }[] {
  const set = new Set(habit.days);
  return lastDays(n).map((day) => ({ day, done: set.has(day) }));
}

/** Tracker counts across the last n days, for a sparkline. */
export function trackerSeries(tracker: Tracker, n = 14): { day: string; value: number }[] {
  return lastDays(n).map((day) => ({ day, value: tracker.counts[day] ?? 0 }));
}

/** Starts per day across the last n days. */
export function startsPerDay(receipts: Receipt[], n = 7): { day: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of receipts) {
    const k = dayKey(new Date(r.at));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return lastDays(n).map((day) => ({ day, count: counts.get(day) ?? 0 }));
}

/** How many of the last n days had at least one start. */
export function activeDays(receipts: Receipt[], n = 7): number {
  return startsPerDay(receipts, n).filter((d) => d.count > 0).length;
}

/**
 * Milestones are deliberately unlosable: they mark totals, never runs, so
 * they can only ever be reached — not broken.
 */
export const MILESTONES = [1, 10, 25, 50, 100, 250, 500, 1000];

export function milestoneFor(total: number): { hit: number; next: number | null } {
  let hit = 0;
  for (const m of MILESTONES) if (total >= m) hit = m;
  const next = MILESTONES.find((m) => m > total) ?? null;
  return { hit, next };
}

export function justHitMilestone(total: number): number | null {
  return MILESTONES.includes(total) ? total : null;
}
