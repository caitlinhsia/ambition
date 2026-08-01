// The starting-type quiz. A mirror, not a diagnosis — it tunes how budge
// talks to you. Deliberately NOT Myers-Briggs: that doesn't hold up
// scientifically, so we keep the fun of a recognizable type without
// dressing it up as fact. Everything here stays on the device.

export type Axis = "push" | "novelty" | "night" | "scale";

export type QuizQuestion = {
  q: string;
  a: { label: string; axis: Axis; value: number }[];
};

export const QUIZ: QuizQuestion[] = [
  {
    q: "you've got a thing due. what actually happens?",
    a: [
      { label: "i open 14 tabs and do none of it", axis: "scale", value: 1 },
      { label: "i do it all at 1am in one panic sprint", axis: "night", value: 1 },
      { label: "i keep waiting until it feels right", axis: "push", value: 1 },
      { label: "i get bored halfway and drift off", axis: "novelty", value: 1 },
    ],
  },
  {
    q: "what gets you moving faster?",
    a: [
      { label: "someone gently telling me to go", axis: "push", value: 1 },
      { label: "something new or a bit weird", axis: "novelty", value: 1 },
      { label: "making it really, really small", axis: "scale", value: 1 },
      { label: "a deadline breathing down my neck", axis: "night", value: 1 },
    ],
  },
  {
    q: "the real reason you don't start is usually…",
    a: [
      { label: "it has to be good, so i freeze", axis: "scale", value: 1 },
      { label: "it's boring and my brain won't", axis: "novelty", value: 1 },
      { label: "i'm just tired. all the time", axis: "push", value: 1 },
      { label: "i lost track of time again", axis: "night", value: 1 },
    ],
  },
  {
    q: "how do you want to be talked to?",
    a: [
      { label: "soft. i'm doing my best", axis: "push", value: 1 },
      { label: "blunt. just tell me to go", axis: "push", value: -1 },
      { label: "funny. make it dumb", axis: "novelty", value: 1 },
      { label: "quiet. minimal words", axis: "scale", value: 1 },
    ],
  },
  {
    q: "when do you feel most stuck?",
    a: [
      { label: "late at night", axis: "night", value: 1 },
      { label: "right after school/work", axis: "push", value: 1 },
      { label: "when there's too much to pick from", axis: "scale", value: 1 },
      { label: "when it's the same thing every day", axis: "novelty", value: 1 },
    ],
  },
];

export type StartingType = {
  key: string;
  name: string;
  blurb: string;
  door: "quick" | "feeling" | "shrinker";
};

export const TYPES: Record<string, StartingType> = {
  scale: {
    key: "scale",
    name: "the too-many-tabs",
    blurb:
      "you don't lack drive — you lack a small enough first step. everything shows up at once and freezes you. budge will keep shrinking things until they're stupidly easy.",
    door: "shrinker",
  },
  novelty: {
    key: "novelty",
    name: "the bored sprinter",
    blurb:
      "you can go fast when it's interesting, and not at all when it isn't. budge will keep it novel, physical and short — and never hand you the same thing twice in a row.",
    door: "quick",
  },
  night: {
    key: "night",
    name: "the 1am spiraler",
    blurb:
      "your worst stalling happens late, and it costs you the next day too. budge gets quieter at night and helps you start *ending* the day instead of starting projects.",
    door: "feeling",
  },
  push: {
    key: "push",
    name: "the running-on-empty",
    blurb:
      "you're not lazy, you're out of gas. budge will meet you low, ask for almost nothing, and count rest as a real win.",
    door: "feeling",
  },
};

export function scoreQuiz(answers: { axis: Axis; value: number }[]): StartingType {
  const totals: Record<Axis, number> = { push: 0, novelty: 0, night: 0, scale: 0 };
  for (const a of answers) totals[a.axis] += a.value;
  let best: Axis = "scale";
  for (const k of Object.keys(totals) as Axis[]) {
    if (totals[k] > totals[best]) best = k;
  }
  return TYPES[best];
}
