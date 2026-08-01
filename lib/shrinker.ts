// The Shrinker — type the thing you're dreading, get one stupidly small
// first move. It never shows you step two, only the next stair.

type Rule = { match: RegExp; steps: string[]; sympathy?: string };

const RULES: Rule[] = [
  {
    match: /essay|paper|report|write|writing|thesis|paragraph/i,
    sympathy: "yeah, essays are the worst.",
    steps: [
      "open a blank doc and give it a title. a bad title. that's the whole task.",
      "write one ugly sentence about what it's even supposed to be about.",
      "write the worst possible first line. you'll fix it later.",
      "list 3 things you might say. bullet points. no sentences.",
    ],
  },
  {
    match: /homework|assignment|worksheet|problem set|pset|math|study|exam|test|revis/i,
    sympathy: "okay. we're not doing all of it.",
    steps: [
      "open it and read only the first question. don't answer it.",
      "do question one. just one. then you're allowed to stop.",
      "get the stuff out — book, paper, pen. that's the task.",
      "set a 2-minute timer and look at it. that's all you owe.",
    ],
  },
  {
    match: /email|text|message|reply|respond|call|dm|answer/i,
    sympathy: "the longer it sits the heavier it gets. let's make it light.",
    steps: [
      "open the message. don't reply. just read it.",
      "write the reply. don't send it. you can delete it after.",
      "reply with one sentence. one. short is fine, late is fine.",
      "draft literally 'hey, sorry for the slow reply —' and stop there.",
    ],
  },
  {
    match: /clean|tidy|room|dishes|laundry|wash|mess|organi[sz]e|vacuum|trash/i,
    sympathy: "we're not cleaning it. we're doing one bit.",
    steps: [
      "throw away 3 pieces of trash. only 3.",
      "pick up 5 things and put them where they live. then stop.",
      "clear one flat surface. just one. the rest can wait.",
      "set a 2-minute timer and go until it beeps.",
    ],
  },
  {
    match: /appl(y|ication)|resume|cv|cover letter|job|college|scholarship|form/i,
    sympathy: "big scary one. we're only cracking it open.",
    steps: [
      "open the form and fill in your name. that's it. that's the task.",
      "read what it actually asks for. don't write anything yet.",
      "answer the easiest field on the whole thing.",
      "save a copy with your name on it. now it exists.",
    ],
  },
  {
    match: /gym|exercise|run|workout|walk|train|fit/i,
    sympathy: "getting there is the hard part, not the doing.",
    steps: [
      "put your shoes on. you don't have to go anywhere.",
      "do 10 of anything. jumping jacks, squats, whatever's nearest.",
      "stretch for 60 seconds. that counts as started.",
      "get changed. that's the whole task. seriously.",
    ],
  },
  {
    match: /practice|instrument|piano|guitar|draw|paint|art|code|project|build/i,
    sympathy: "the blank start is the worst bit.",
    steps: [
      "get it out and put it in front of you. don't start yet.",
      "do the worst, laziest version for 2 minutes.",
      "do one small piece — one bar, one sketch, one function.",
      "open the file. look at where you left off. that's enough.",
    ],
  },
  {
    match: /sleep|bed|wake|shower|eat|meal|cook|water|med|pill/i,
    sympathy: "basic stuff is genuinely hard sometimes. no judgment.",
    steps: [
      "do the smallest version of it. half counts. a quarter counts.",
      "get the thing you need and put it somewhere you'll see it.",
      "set a 2-minute timer and start. stopping after is allowed.",
      "do the first physical move — stand up, open the door, turn the tap.",
    ],
  },
];

const FALLBACK: string[] = [
  "open it. don't do it. just open it.",
  "set a 2-minute timer and do the worst possible version.",
  "do the smallest piece you can see. then you're allowed to stop.",
  "write one sentence about what the actual first step is.",
  "get whatever you need for it within arm's reach. that's the task.",
];

const FALLBACK_SYMPATHY = "okay. we're not doing the whole thing.";

export function shrink(
  input: string,
  stepIndex = 0
): { sympathy: string; step: string; more: boolean } {
  const text = input.trim();
  const rule = RULES.find((r) => r.match.test(text));
  const steps = rule ? rule.steps : FALLBACK;
  const sympathy = rule?.sympathy ?? FALLBACK_SYMPATHY;
  const i = stepIndex % steps.length;
  return {
    sympathy,
    step: steps[i],
    more: stepIndex < steps.length - 1,
  };
}
