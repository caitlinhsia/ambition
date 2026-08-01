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
    "open the curtains. that's the whole task.",
    "drink a full glass of water. slowly.",
    "step outside for 30 seconds. the doorway counts.",
    "put on one song you used to love.",
    "wash your face. cold water. that's it.",
  ],
  ground: [
    "name 5 things you can see right now. out loud is better.",
    "one slow breath. in for 4, out for 6.",
    "open the thing you're dreading. don't do it. just look.",
    "feet flat on the floor. press down for 10 seconds.",
    "write down the worry. one line. get it out of your head.",
  ],
  move: [
    "10 jumping jacks. right now. go.",
    "blast one song and move however you want for 30 seconds.",
    "set a 2-minute timer and race it — tidy what's nearest.",
    "10 pushups. bad form absolutely counts.",
    "walk to the end of the street and back.",
  ],
  rest: [
    "one stretch, then get right back under. that's it.",
    "close your eyes for 60 seconds. that's the task.",
    "no real task. just drink some water and be kind to yourself.",
    "phone down for one minute. only breathe.",
    "lie down properly instead of half-slumped. small upgrade.",
  ],
  bored: [
    "open wikipedia's 'random article' and read one paragraph.",
    "move one object in your room somewhere new.",
    "text someone the dumbest question you can think of.",
    "play 30 seconds of a genre you never listen to.",
    "draw something badly for one minute. badly is the point.",
  ],
  steady: [
    "text one person a meme. any meme.",
    "make your bed. or just the pillows. dealer's choice.",
    "write one sentence of the thing you're avoiding.",
    "open the assignment and read only the first line.",
    "throw away 3 pieces of trash near you.",
  ],
  calm: [
    "nice. bank it — one slow breath and just notice you feel okay.",
    "good moment to set future-you up: tidy one small thing.",
    "write one line about today. just one.",
    "pick one tiny thing you'd like to keep doing, and do it now.",
  ],
  savor: [
    "quick — write down one good thing right now, before it fades.",
    "you've got momentum. start the thing you've been dreading. now, while it's easy.",
    "text someone you appreciate and tell them. one line.",
    "do the slightly bigger thing — you can handle it today.",
    "take a photo of right now. you'll want it on a worse day.",
  ],
  unnamed: [
    "hard to name, huh. that's normal. drink some water while it sorts itself out.",
    "you don't need the word for it. just take one slow breath.",
    "no name, no problem. stand up and stretch for 10 seconds.",
    "sit with it a sec, then open a window. small.",
  ],
};

export const WINS = [
  "look at you. that was real, i saw it.",
  "that counts. it fully counts.",
  "started. that's the whole game.",
  "first step, done. nice.",
  "the bar was on the floor. you stepped over it.",
  "you budged. genuinely, that's the hard part.",
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
