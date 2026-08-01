// The Shrinker — name the thing you want to tackle, get one small first
// move. It never shows you step two, only the next stair.

type Rule = { match: RegExp; steps: string[]; intro?: string };

const RULES: Rule[] = [
  {
    match: /essay|paper|report|write|writing|thesis|paragraph/i,
    intro: "big one. we're just cracking it open.",
    steps: [
      "open a blank doc and give it a title. a rough one counts.",
      "write one rough sentence about what it's actually about.",
      "write a first line. you can sharpen it later.",
      "list 3 points you could make. bullets, not sentences.",
    ],
  },
  {
    match: /homework|assignment|worksheet|problem set|pset|math|study|exam|test|revis/i,
    intro: "not all of it. just the first move.",
    steps: [
      "open it and read the first question.",
      "do question one. that's the target.",
      "get the stuff out — book, paper, pen.",
      "set a 2 minute timer and get into it.",
    ],
  },
  {
    match: /email|text|message|reply|respond|call|dm|answer/i,
    intro: "quickest win on your list. let's clear it.",
    steps: [
      "open the message and read it.",
      "draft the reply. sending is optional.",
      "reply in one sentence. short wins.",
      "start with 'hey, sorry for the slow reply —' and go from there.",
    ],
  },
  {
    match: /clean|tidy|room|dishes|laundry|wash|mess|organi[sz]e|vacuum|trash/i,
    intro: "one bit now beats all of it never.",
    steps: [
      "throw away 3 pieces of trash.",
      "put 5 things back where they belong.",
      "clear one surface completely.",
      "set a 2 minute timer and go until it beeps.",
    ],
  },
  {
    match: /appl(y|ication)|resume|cv|cover letter|job|college|scholarship|form/i,
    intro: "big one. we only need the first field.",
    steps: [
      "open the form and fill in your name.",
      "read what it actually asks for.",
      "answer the easiest field.",
      "save a copy with your name on it. now it's real.",
    ],
  },
  {
    match: /gym|exercise|run|workout|walk|train|fit/i,
    intro: "the hard part is getting there. do that bit.",
    steps: [
      "put your shoes on.",
      "do 10 of anything — jumping jacks, squats, whatever's nearest.",
      "stretch for 60 seconds.",
      "get changed. that's the whole hurdle.",
    ],
  },
  {
    match: /practice|instrument|piano|guitar|draw|paint|art|code|project|build/i,
    intro: "blank pages lose to anyone who starts.",
    steps: [
      "get it out and put it in front of you.",
      "make a rough version for 2 minutes.",
      "do one small piece — one bar, one sketch, one function.",
      "open the file and find where you left off.",
    ],
  },
  {
    match: /sleep|bed|wake|shower|eat|meal|cook|water|med|pill/i,
    intro: "small and non-negotiable. knock it out.",
    steps: [
      "do the smallest version of it. half counts.",
      "get the thing you need and put it somewhere you'll see it.",
      "set a 2 minute timer and start.",
      "do the first physical move — stand up, open the door, turn the tap.",
    ],
  },
];

const FALLBACK: string[] = [
  "open it. that's the first move.",
  "set a 2 minute timer and make a rough pass.",
  "do the smallest piece you can see.",
  "write down what the actual first step is.",
  "get everything you need within arm's reach.",
];

const FALLBACK_SYMPATHY = "we're not doing the whole thing. just the opener.";

export function shrink(
  input: string,
  stepIndex = 0
): { intro: string; step: string; more: boolean } {
  const text = input.trim();
  const rule = RULES.find((r) => r.match.test(text));
  const steps = rule ? rule.steps : FALLBACK;
  const intro = rule?.intro ?? FALLBACK_SYMPATHY;
  const i = stepIndex % steps.length;
  return {
    intro,
    step: steps[i],
    more: stepIndex < steps.length - 1,
  };
}
