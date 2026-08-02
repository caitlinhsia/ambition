// The day log — the two-second version of journalling.
//
// Two taps (weather, how it went) and a few bars you fill in. It exists
// because writing a line is a real ask on a bad day, and a day with nothing
// in it reads like a day that didn't count.

import { Tracker } from "./store";

export type Choice = { key: string; label: string; mark: string };

/** Weather gets logged because it moves how a day feels more than people
 *  credit, and it's the one thing nobody can blame themselves for. */
export const WEATHER: Choice[] = [
  { key: "sun", label: "sun", mark: "☀" },
  { key: "cloud", label: "cloud", mark: "☁" },
  { key: "grey", label: "grey", mark: "▨" },
  { key: "rain", label: "rain", mark: "☂" },
  { key: "storm", label: "storm", mark: "⚡" },
  { key: "snow", label: "snow", mark: "❄" },
  { key: "wind", label: "wind", mark: "≋" },
  { key: "hot", label: "hot", mark: "▲" },
  { key: "cold", label: "cold", mark: "▼" },
  { key: "in", label: "stayed in", mark: "▢" },
];

/** How the day went, in one word. Deliberately blunter than the feeling menu
 *  in lib/feelings.ts — that one asks "what now?", this one just closes the
 *  day off. Good words outnumber hard ones, because most days are mixed and
 *  a list of only hard words invites you to pick one. */
export const DAY_MOODS: Choice[] = [
  { key: "good", label: "good", mark: "" },
  { key: "light", label: "light", mark: "" },
  { key: "proud", label: "proud", mark: "" },
  { key: "calm", label: "calm", mark: "" },
  { key: "steady", label: "steady", mark: "" },
  { key: "quiet", label: "quiet", mark: "" },
  { key: "mixed", label: "mixed", mark: "" },
  { key: "busy", label: "busy", mark: "" },
  { key: "tired", label: "tired", mark: "" },
  { key: "flat", label: "flat", mark: "" },
  { key: "wired", label: "wired", mark: "" },
  { key: "heavy", label: "heavy", mark: "" },
];

export function weatherOf(key?: string): Choice | undefined {
  return WEATHER.find((w) => w.key === key);
}

/**
 * A full bar for known things.
 *
 * These are common starting points, not recommendations — budg3 isn't
 * medical software and doesn't tell anyone what their body needs. They exist
 * so a new bar has some length to it instead of asking you to invent a number
 * before you've logged anything, and every one is a tap away from being
 * replaced by your own.
 */
// Every alternative gets a LEADING \b, because without one "breathing"
// matches "eat" and "workouts" matches "work". No trailing \b — that would
// stop "stud" matching "study", which is the whole point of the prefixes.
// Order matters too: specific before generic, so "workout" is caught before
// the "work" rule can claim it.
const COMMON: { match: RegExp; amount: number }[] = [
  { match: /\bwater|\bhydrat|\bglass|\bdrink/i, amount: 8 },
  { match: /\boutside|\boutdoor|\bdaylight|\bfresh air|\bsunlight/i, amount: 20 },
  { match: /\bsleep|\bslept|\bbed\b|\bbedtime/i, amount: 8 },
  { match: /\bstep/i, amount: 6000 },
  { match: /\bwalk/i, amount: 1 },
  { match: /\bread|\bpage|\bbook/i, amount: 20 },
  { match: /\bworkout|\bexercise|\bgym|\btrain|\brun\b|\brunning|\blift|\bswim|\bride|\bcycl/i, amount: 1 },
  { match: /\bstud(y|ied)|\brevis|\bhomework|\bcoursework/i, amount: 45 },
  { match: /\bfocus|\bdeep work|\bwork/i, amount: 45 },
  { match: /\bstretch|\byoga|\bmobility/i, amount: 10 },
  { match: /\bmov(e|ing|ement)|\bactive|\bactivity/i, amount: 20 },
  { match: /\bscreen.?free|\boff my phone|\bno phone|\bphone.?free/i, amount: 60 },
  { match: /\bpractice|\binstrument|\bguitar|\bpiano|\bdrum|\bsing/i, amount: 20 },
  { match: /\bmeal|\bcook|\beat|\bate\b/i, amount: 3 },
  { match: /\bjournal|\bwrit|\bdraw|\bpaint|\bmake/i, amount: 1 },
  { match: /\bbreath|\bmeditat|\bcalm|\bground/i, amount: 5 },
  { match: /\btidy|\bclean|\broom|\bchore|\bwash|\bdish|\blaundry/i, amount: 10 },
  { match: /\btalk|\btext|\bcall|\bmessag|\bfriend|\bpeople/i, amount: 1 },
  { match: /\bmoney|\bsave/i, amount: 5 },
];

export type Target = {
  /** What a full bar means. */
  target: number;
  /** Where that number came from, so the interface can be honest about it. */
  source: "goal" | "common" | "typical" | "any";
  note: string;
};

/**
 * What a full bar means for one tracker.
 *
 * Your own goal always wins. Failing that: a common starting point for things
 * budg3 recognises, then your own typical day once there's enough history to
 * have one, then 1 — where a full bar just means you did it at all.
 */
export function targetFor(tr: Tracker): Target {
  if (typeof tr.goal === "number" && tr.goal > 0) {
    return { target: tr.goal, source: "goal", note: "your goal" };
  }

  const common = COMMON.find((c) => c.match.test(tr.name));
  if (common) {
    return { target: common.amount, source: "common", note: "a common starting point — set your own" };
  }

  const logged = Object.values(tr.counts).filter((n) => n > 0);
  if (logged.length >= 4) {
    const sorted = [...logged].sort((a, b) => a - b);
    const mid = sorted[Math.floor(sorted.length / 2)];
    return { target: Math.max(1, Math.round(mid)), source: "typical", note: "your usual day, so far" };
  }

  return { target: 1, source: "any", note: "a full bar just means you did it" };
}

/** Bars are clickable segment-by-segment when there aren't too many of them.
 *  Past that a segment would be a sliver, so it becomes one solid bar. */
export function segmented(target: number): boolean {
  return target <= 12;
}
