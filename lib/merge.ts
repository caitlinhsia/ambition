// Merging two versions of the same account.
//
// Sync means the same account gets edited in two places — the phone on the
// bus and the laptop at home, one of them offline. Something has to decide
// what the truth is when they meet.
//
// The usual answer is last-write-wins: newest upload replaces everything.
// That would let a stale phone erase an evening's work, and rule one of this
// app is that there is nothing you can lose. So instead every type here is
// merged so that the result contains everything both sides had:
//
//   sets union            receipts, habits, journal, walls, bricks
//   counters take the max started, tracker counts per day
//   day grids union       habit days
//   progress sticks       a knocked-out brick never goes back in the wall
//   single values         newest wins — names, goals, weather, profile
//
// The trade-offs are real and worth knowing:
//   - Deleting something on one device does not delete it on the other. It
//     comes back on the next merge. Losing a habit is worse than seeing one
//     you meant to bin, so union wins, but it does mean deletes need both
//     devices online to stick.
//   - Correcting a count downwards on one device is overridden by the higher
//     count on the other. Counters only rise, here as everywhere else.

import { Brick, DayLog, Habit, JournalEntry, Plan, Profile, Receipt, State, Tracker, Wall } from "./store";

const MAX_RECEIPTS = 500;
const MAX_JOURNAL = 1000;

/** Union two lists by id. `pick` resolves the pair when both sides have one. */
function unionById<T extends { id: string }>(
  older: T[],
  newer: T[],
  pick: (o: T, n: T) => T
): T[] {
  const out = new Map<string, T>();
  for (const item of older) out.set(item.id, item);
  for (const item of newer) {
    const existing = out.get(item.id);
    out.set(item.id, existing ? pick(existing, item) : item);
  }
  return [...out.values()];
}

function mergeProfile(older: Profile, newer: Profile): Profile {
  return {
    // Once you've been through onboarding you've been through it. Neither of
    // these ever goes back to false, so OR is the whole rule.
    onboarded: older.onboarded || newer.onboarded,
    tutorialDone: older.tutorialDone || newer.tutorialDone,
    // Answers you gave: the newer one, unless it was never filled in.
    typeKey: newer.typeKey ?? older.typeKey,
    age: newer.age ?? older.age,
    gender: newer.gender ?? older.gender,
  };
}

function mergeHabit(older: Habit, newer: Habit): Habit {
  return {
    id: newer.id,
    name: newer.name,
    // A day done on either device is a day done.
    days: [...new Set([...older.days, ...newer.days])].sort(),
  };
}

function mergeTracker(older: Tracker, newer: Tracker): Tracker {
  const counts: Record<string, number> = { ...older.counts };
  for (const [day, n] of Object.entries(newer.counts)) {
    counts[day] = Math.max(counts[day] ?? 0, n);
  }
  return {
    id: newer.id,
    name: newer.name,
    unit: newer.unit,
    counts,
    ...(newer.goal ?? older.goal ? { goal: newer.goal ?? older.goal } : {}),
  };
}

/** A brick that came out of the wall stays out. Nothing un-knocks. */
function mergeBrickState(a: Brick["state"], b: Brick["state"]): Brick["state"] {
  if (a === "down" || b === "down") return "down";
  if (a === "aside" || b === "aside") return "aside";
  return "in";
}

function mergeWall(older: Wall, newer: Wall): Wall {
  const bricks = unionById<Brick>(older.bricks, newer.bricks, (o, n) => ({
    id: n.id,
    text: n.text,
    state: mergeBrickState(o.state, n.state),
  }));
  const allDown = bricks.length > 0 && bricks.every((b) => b.state !== "in");
  const finishedAt = older.finishedAt ?? newer.finishedAt;
  return {
    id: newer.id,
    name: newer.name,
    bricks,
    createdAt: Math.min(older.createdAt, newer.createdAt),
    // Merging can finish a wall that neither device had finished alone.
    ...(allDown ? { finishedAt: finishedAt ?? Date.now() } : finishedAt ? { finishedAt } : {}),
  };
}

function mergeDayLogs(
  older: Record<string, DayLog>,
  newer: Record<string, DayLog>
): Record<string, DayLog> {
  const out: Record<string, DayLog> = { ...older };
  for (const [day, log] of Object.entries(newer)) {
    const prev = out[day];
    out[day] = prev ? { weather: log.weather ?? prev.weather, mood: log.mood ?? prev.mood } : log;
  }
  return out;
}

/**
 * Combine two versions of one account's data.
 *
 * Order matters only for values that can't be unioned — pass the state with
 * the later `updatedAt` as `newer`.
 */
export function mergeStates(older: State, newer: State): State {
  const receipts = unionById<Receipt>(older.receipts, newer.receipts, (_o, n) => n)
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_RECEIPTS);

  const journal = unionById<JournalEntry>(older.journal, newer.journal, (_o, n) => n)
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_JOURNAL);

  return {
    profile: mergeProfile(older.profile, newer.profile),
    // Never fewer starts than either side knew about, and never fewer than
    // the receipts actually in hand.
    started: Math.max(older.started, newer.started, receipts.length),
    receipts,
    habits: unionById<Habit>(older.habits, newer.habits, mergeHabit),
    trackers: unionById<Tracker>(older.trackers, newer.trackers, mergeTracker),
    plans: unionById<Plan>(older.plans, newer.plans, (o, n) => ({ ...n, done: o.done || n.done })),
    journal,
    walls: unionById<Wall>(older.walls, newer.walls, mergeWall),
    dayLogs: mergeDayLogs(older.dayLogs, newer.dayLogs),
    updatedAt: Math.max(older.updatedAt ?? 0, newer.updatedAt ?? 0),
  };
}
