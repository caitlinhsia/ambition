// Rotating copy. Anything the app says more than once lives here with enough
// variants that you don't see the same line twice in a session.

function pick(list: string[], avoid?: string | null): string {
  if (list.length === 1) return list[0];
  let t = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (t === avoid && guard++ < 12) t = list[Math.floor(Math.random() * list.length)];
  return t;
}

/** Shown after you finish a step. */
export const WINS = [
  "that's momentum.",
  "you're moving.",
  "one down. keep it rolling.",
  "that's how it starts.",
  "good. go again?",
  "hardest part's behind you.",
  "you're on.",
  "that's the wheel turning.",
  "logged. next?",
  "you showed up. that's the whole trick.",
  "chalk it up.",
  "that's a real one.",
  "momentum's yours now.",
  "started beats perfect.",
  "nice. that wasn't so bad.",
  "you're ahead of where you were.",
  "banked it.",
  "that's one more than yesterday-you.",
  "clean start.",
  "you did the thing. keep going.",
  "in motion now.",
  "that's how the streak begins.",
];

/** The line above the countdown. */
export const COUNTDOWN = [
  "go when it hits zero.",
  "don't think. just be ready.",
  "get set.",
  "on zero, you move.",
  "no negotiating. just go.",
  "line it up.",
  "ten seconds, then it's happening.",
  "hands ready.",
];

/** When someone swaps the step for a different one. */
export const SWAPPED = [
  "fine. try this one.",
  "no problem — here's another.",
  "swapped.",
  "different angle:",
  "how about this instead.",
  "alright, this one:",
  "new one, same deal.",
];

/** The prompt to keep going after a win. */
export const AGAIN = [
  "go again →",
  "another one →",
  "keep it rolling →",
  "one more →",
  "next move →",
  "stack another →",
];

/** Sub-line on the main start panel. */
export const IDLE_SUB = [
  "one small thing, right now. that's how everything starts.",
  "pick it up and go. two minutes is plenty.",
  "the first move is the only hard one.",
  "small and now beats big and later.",
  "you don't need a plan. you need a first step.",
  "start ugly. fix it later.",
];

/** Body-doubling timer, mid-session. */
export const TIMER_MID = [
  "you're in it. keep going.",
  "stay on it.",
  "nearly there. don't drift.",
  "eyes on the thing.",
  "still going. good.",
];

/** After the two minutes are up. */
export const TIMER_DONE = [
  "ride it or bank it — both count.",
  "keep going while you're warm.",
  "that's two. want two more?",
  "you're already in it. easier from here.",
];

export const pickWin = (avoid?: string | null) => pick(WINS, avoid);
export const pickCountdown = () => pick(COUNTDOWN);
export const pickSwapped = (avoid?: string | null) => pick(SWAPPED, avoid);
export const pickAgain = () => pick(AGAIN);
export const pickIdleSub = () => pick(IDLE_SUB);
export const pickTimerMid = () => pick(TIMER_MID);
export const pickTimerDone = () => pick(TIMER_DONE);
