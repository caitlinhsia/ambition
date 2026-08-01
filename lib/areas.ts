// Life areas. The point of these is breadth: someone should be able to open
// budg3 because they want to get fitter, write more, or stop leaving essays
// to the last night — not because they're having a bad time. Feelings are one
// way in; this is the other.

export type Area = {
  key: string;
  name: string;
  blurb: string;
  starts: string[];
  habits: string[];
};

export const AREAS: Area[] = [
  {
    key: "school",
    name: "school & work",
    blurb: "essays, revision, the thing due friday",
    starts: [
      "open the doc. don't write. just open it.",
      "read only the first question. you don't have to answer it.",
      "write the worst possible opening line. you'll fix it later.",
      "get your stuff out and put it on the desk. that's the task.",
      "set a 2-minute timer and look at the thing. that's all you owe.",
    ],
    habits: ["10 minutes of work", "phone in another room", "plan tomorrow", "one page of revision"],
  },
  {
    key: "body",
    name: "body & movement",
    blurb: "getting stronger, or just off the chair",
    starts: [
      "10 pushups. bad form absolutely counts.",
      "put your shoes on. you don't have to go anywhere.",
      "stretch for 60 seconds. that's a full workout today.",
      "walk to the end of the street and back.",
      "30 seconds of jumping around to one song.",
    ],
    habits: ["move for 10 min", "stretch", "walk outside", "drink water", "sleep before midnight"],
  },
  {
    key: "creative",
    name: "making things",
    blurb: "writing, music, art, code, whatever you build",
    starts: [
      "open the file and look at where you left off. that's enough.",
      "make the worst, laziest version for 2 minutes.",
      "do one small piece — one bar, one sketch, one function.",
      "write one sentence. any sentence. it can be bad.",
      "get the thing out and put it in front of you.",
    ],
    habits: ["make something for 15 min", "write one line", "practice", "post one thing"],
  },
  {
    key: "social",
    name: "people",
    blurb: "the texts you owe, the plans you keep not making",
    starts: [
      "reply to one message. one line is a complete reply.",
      "text someone a meme. that counts as contact.",
      "ask one person how they're doing. actually send it.",
      "make the plan you've been meaning to make. suggest one day.",
    ],
    habits: ["message one person", "call someone", "see a friend", "say one true thing"],
  },
  {
    key: "space",
    name: "your space",
    blurb: "the room, the pile, the sink",
    starts: [
      "throw away 3 pieces of trash. only 3.",
      "clear one flat surface. just one.",
      "put 5 things where they live, then stop.",
      "make your bed. or just the pillows. dealer's choice.",
    ],
    habits: ["tidy for 5 min", "make the bed", "dishes", "one thing off the floor"],
  },
  {
    key: "money",
    name: "money & admin",
    blurb: "forms, applications, the boring adult stuff",
    starts: [
      "open the form and fill in your name. that's it.",
      "read what it actually asks for. don't write anything yet.",
      "answer the single easiest field on the whole thing.",
      "check the balance. just look. no decisions.",
    ],
    habits: ["check the balance", "one admin thing", "save something"],
  },
  {
    key: "mind",
    name: "head space",
    blurb: "focus, calm, getting out of your own way",
    starts: [
      "one slow breath. in for 4, out for 6.",
      "name 5 things you can see right now.",
      "write down the thing rattling around. one line. get it out.",
      "close every tab but one.",
    ],
    habits: ["journal one line", "breathe for 2 min", "no phone first hour", "read 5 pages"],
  },
  {
    key: "fun",
    name: "actually enjoying things",
    blurb: "the stuff you keep meaning to get back to",
    starts: [
      "play 30 seconds of a genre you never listen to.",
      "open wikipedia's random article and read one paragraph.",
      "draw something badly for one minute. badly is the point.",
      "do the hobby thing for 2 minutes. just start it.",
    ],
    habits: ["do the hobby", "read for fun", "learn one thing", "go outside"],
  },
];

export function areaByKey(key: string): Area | undefined {
  return AREAS.find((a) => a.key === key);
}

export function pickStart(area: Area, avoid?: string | null): string {
  const list = area.starts;
  if (list.length === 1) return list[0];
  let t = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (t === avoid && guard++ < 10) t = list[Math.floor(Math.random() * list.length)];
  return t;
}
