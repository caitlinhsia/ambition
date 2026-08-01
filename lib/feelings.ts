// The feeling menu — emotional granularity, from numb to joyful.
// Naming a feeling precisely is the first intervention, not decoration.

export type Pool =
  | "gentle"
  | "ground"
  | "move"
  | "rest"
  | "bored"
  | "steady"
  | "calm"
  | "savor"
  | "unnamed";

export type Feeling = { word: string; pool: Pool };

export const FEELINGS: Feeling[] = [
  // nothing's landing
  { word: "flat", pool: "gentle" },
  { word: "numb", pool: "gentle" },
  { word: "empty", pool: "gentle" },
  { word: "hollow", pool: "gentle" },
  { word: "foggy", pool: "gentle" },
  { word: "detached", pool: "gentle" },
  // can't settle
  { word: "on edge", pool: "ground" },
  { word: "anxious", pool: "ground" },
  { word: "dread", pool: "ground" },
  { word: "overwhelmed", pool: "ground" },
  { word: "keyed up", pool: "ground" },
  // energy, no aim
  { word: "restless", pool: "move" },
  { word: "antsy", pool: "move" },
  { word: "scattered", pool: "move" },
  // tank's out
  { word: "heavy", pool: "rest" },
  { word: "wired but tired", pool: "rest" },
  { word: "drained", pool: "rest" },
  { word: "burnt out", pool: "rest" },
  // under-stimulated
  { word: "bored", pool: "bored" },
  { word: "meh", pool: "bored" },
  { word: "stuck", pool: "bored" },
  { word: "blah", pool: "bored" },
  { word: "curious", pool: "bored" },
  // steady
  { word: "okay", pool: "steady" },
  { word: "alright", pool: "steady" },
  { word: "content", pool: "calm" },
  { word: "calm", pool: "calm" },
  { word: "relieved", pool: "calm" },
  // riding a good one
  { word: "good", pool: "savor" },
  { word: "joyful", pool: "savor" },
  { word: "excited", pool: "savor" },
  { word: "proud", pool: "savor" },
  { word: "grateful", pool: "savor" },
  { word: "energized", pool: "savor" },
  { word: "hopeful", pool: "savor" },
  // no word for it
  { word: "can't name it", pool: "unnamed" },
];

export const POSITIVE_POOLS: Pool[] = ["savor", "calm"];

// A low-battery day never gets met with a demand.
export const TASKS: Record<Pool, string[]> = {
  gentle: [
    "open the curtains.",
    "drink a glass of water.",
    "step outside for 30 seconds.",
    "put on one song you used to love.",
    "wash your face with cold water.",
    "change out of what you slept in.",
    "open a window.",
    "sit up.",
    "eat one thing, however small.",
    "turn on a lamp instead of the big light.",
    "put one thing back where it belongs.",
    "brush your teeth.",
  ],
  ground: [
    "name 5 things you can see.",
    "one slow breath — in for 4, out for 6.",
    "open the thing you're putting off. just look at it.",
    "feet flat on the floor. press down for 10 seconds.",
    "write the worry down in one line.",
    "unclench your jaw and drop your shoulders.",
    "hold something cold for 20 seconds.",
    "count backwards from 30.",
    "put your phone face down for 2 minutes.",
    "write down the smallest next step.",
    "stand up and stretch your arms overhead.",
    "tell one person what you're dealing with.",
  ],
  move: [
    "10 jumping jacks.",
    "put on one song and move for 30 seconds.",
    "set a 2 minute timer and tidy whatever's nearest.",
    "10 pushups.",
    "walk to the end of the street and back.",
    "20 squats.",
    "run up and down the stairs once.",
    "stretch for 60 seconds.",
    "do the dishes that are already in the sink.",
    "walk one lap around the room.",
    "shadow box for 30 seconds.",
    "hold a plank for as long as you can.",
  ],
  rest: [
    "one stretch, then get comfortable again.",
    "close your eyes for 60 seconds.",
    "drink some water.",
    "phone down for one minute.",
    "lie down properly instead of half-slumped.",
    "put on something you've already seen and switch off.",
    "get under a blanket.",
    "set an alarm so you can stop clock-watching.",
    "eat something. anything.",
    "turn the lights down.",
    "take your shoes off and actually sit down.",
    "rest properly. you'll come back sharper.",
  ],
  bored: [
    "open wikipedia's random article and read one paragraph.",
    "move one object in your room somewhere new.",
    "text someone a dumb question.",
    "play 30 seconds of a genre you never listen to.",
    "draw something badly for a minute.",
    "learn one word in another language.",
    "look up how something near you is made.",
    "rearrange one shelf.",
    "write down 3 things you'd do with a free day.",
    "find a photo from a year ago.",
    "try writing with your other hand.",
    "pick a random recipe and read it.",
  ],
  steady: [
    "text one person a meme.",
    "make your bed.",
    "write one sentence of the thing you're avoiding.",
    "open the assignment and read the first line.",
    "throw away 3 pieces of trash.",
    "reply to one message you've been sitting on.",
    "clear one surface.",
    "put 5 things where they belong.",
    "10 minutes on the thing that's due soonest.",
    "check one thing off a list you already made.",
    "fill your water bottle.",
    "write tomorrow's first task on paper.",
  ],
  calm: [
    "one slow breath. bank the good day.",
    "tidy one small thing for future-you.",
    "write one line about today.",
    "pick something you want to keep doing, and do it now.",
    "message someone just to say hi.",
    "put on music you actually like and sit with it.",
    "plan one nice thing for this week.",
    "stretch while you've got the patience for it.",
  ],
  savor: [
    "write down one good thing while it's fresh.",
    "start the thing you've been dreading, while it feels easy.",
    "text someone you appreciate.",
    "do the slightly bigger version today.",
    "take a photo of right now.",
    "do 15 minutes on the thing you care about most.",
    "say yes to one thing you'd normally skip.",
    "get ahead on something future-you will thank you for.",
    "share what you made with one person.",
    "write down what's working, so you remember later.",
  ],
  unnamed: [
    "drink some water and reset.",
    "take one slow breath.",
    "stand up and stretch for 10 seconds.",
    "open a window.",
    "put on one song and move.",
    "step outside for a minute.",
    "dump whatever's in your head for 30 seconds.",
    "do one thing you can see from where you're sitting.",
  ],
};

export const WINS = [
  "that's momentum.",
  "you're moving.",
  "one down. keep it rolling.",
  "that's how it starts.",
  "good. go again?",
  "hardest part's behind you.",
  "you're on.",
];

export function pickTask(pool: Pool, avoid?: string | null): string {
  const list = TASKS[pool];
  if (list.length === 1) return list[0];
  let t = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (t === avoid && guard++ < 10) {
    t = list[Math.floor(Math.random() * list.length)];
  }
  return t;
}

export function pickWin(): string {
  return WINS[Math.floor(Math.random() * WINS.length)];
}
