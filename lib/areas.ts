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
      "open the doc. don't write, just open it.",
      "read the first question. you don't have to answer it.",
      "write a rough opening line.",
      "get your stuff out on the desk.",
      "set a 2 minute timer and look at it.",
      "open the doc and write the title.",
      "10 minutes, then you can stop.",
      "read one page of the notes.",
      "write down what is actually due and when.",
      "do the easiest question first.",
      "email the teacher the question you have.",
      "clear your desk before you start."],
    habits: ["10 minutes of work", "phone in another room", "plan tomorrow", "one page of revision", "start before 9pm", "one question a day"],
  },
  {
    key: "body",
    name: "body & movement",
    blurb: "getting stronger, or just off the chair",
    starts: [
      "10 pushups.",
      "put your shoes on.",
      "stretch for 60 seconds.",
      "walk to the end of the street and back.",
      "move to one song for 30 seconds.",
      "drink a glass of water.",
      "20 squats.",
      "stretch your back for 30 seconds.",
      "walk somewhere instead of scrolling.",
      "get changed into gym clothes.",
      "go up and down the stairs twice."],
    habits: ["move for 10 min", "stretch", "walk outside", "drink water", "sleep before midnight", "10 pushups", "gym"],
  },
  {
    key: "creative",
    name: "making things",
    blurb: "writing, music, art, code, whatever you build",
    starts: [
      "open the file and look at where you left off.",
      "make a rough version for 2 minutes.",
      "do one small piece — one bar, one sketch, one function.",
      "write one sentence.",
      "get it out and put it in front of you.",
      "name the file.",
      "work on it for 10 minutes.",
      "fix one small thing you already know is wrong.",
      "look at something you made a year ago.",
      "make the ugly first version."],
    habits: ["make something for 15 min", "write one line", "practice", "post one thing", "sketch daily"],
  },
  {
    key: "social",
    name: "people",
    blurb: "the texts you owe, the plans you keep not making",
    starts: [
      "reply to one message. one line is enough.",
      "text someone a meme.",
      "ask one person how they're doing.",
      "suggest a day to meet up.",
      "send one message you owe.",
      "suggest one day to meet up.",
      "reply to the group chat.",
      "tell someone one true thing."],
    habits: ["message one person", "call someone", "see a friend", "say one true thing", "check in on someone"],
  },
  {
    key: "space",
    name: "your space",
    blurb: "the room, the pile, the sink",
    starts: [
      "throw away 3 pieces of trash.",
      "clear one surface.",
      "put 5 things back where they belong.",
      "make your bed.",
      "clear the floor by your bed.",
      "put the laundry in the machine.",
      "one shelf, two minutes.",
      "open a window and let it air out."],
    habits: ["tidy for 5 min", "make the bed", "dishes", "one thing off the floor", "laundry"],
  },
  {
    key: "money",
    name: "money & admin",
    blurb: "forms, applications, the boring adult stuff",
    starts: [
      "open the form and fill in your name.",
      "read what it actually asks for.",
      "answer the easiest field.",
      "check the balance. no decisions yet.",
      "find the document you need and put it somewhere obvious.",
      "write down the deadline.",
      "do the 2 minute version of it."],
    habits: ["check the balance", "one admin thing", "save something", "track one spend"],
  },
  {
    key: "mind",
    name: "head space",
    blurb: "focus, calm, getting out of your own way",
    starts: [
      "one slow breath — in for 4, out for 6.",
      "name 5 things you can see.",
      "write down what's rattling around. one line.",
      "close every tab but one.",
      "write down what is actually bothering you.",
      "put your phone in another room for 10 minutes.",
      "go outside without headphones."],
    habits: ["journal one line", "breathe for 2 min", "no phone first hour", "read 5 pages", "no screens after 11"],
  },
  {
    key: "fun",
    name: "actually enjoying things",
    blurb: "the stuff you keep meaning to get back to",
    starts: [
      "play 30 seconds of a genre you never listen to.",
      "open wikipedia's random article and read one paragraph.",
      "draw something badly for a minute.",
      "do the hobby thing for 2 minutes.",
      "do the hobby thing for 2 minutes.",
      "put on the album properly and do nothing else.",
      "plan one thing to look forward to."],
    habits: ["do the hobby", "read for fun", "learn one thing", "go outside", "make time for one good thing"],
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
