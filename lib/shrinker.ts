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
  {
    match: /\b(book|appoint|doctor|dentist|gp|schedule|call.*(office|clinic)|renew|passport|licen[cs]e)\b/i,
    intro: "one phone call's worth. that's it.",
    steps: [
      "find the number or the booking page. don't call yet.",
      "write down what you need to say. one line.",
      "make the call. if it's closed, that still counts as done.",
      "put the appointment in your calendar the moment you have it.",
    ],
  },
  {
    match: /\b(pack|move|move out|suitcase|trip|holiday|travel|flight)\b/i,
    intro: "packing is 50 small decisions. do one.",
    steps: [
      "get the bag out and open it.",
      "put in the three things you'd be stuck without.",
      "make a list of what's left. don't pack it yet.",
      "pack one category — just socks, just chargers.",
    ],
  },
  {
    match: /\b(revise|revision|flashcard|memoris|memoriz|notes|recap)\b/i,
    intro: "one topic. not the syllabus.",
    steps: [
      "open your notes at the topic you like least.",
      "read one page and close it. that's a pass.",
      "write 3 questions you can't answer yet.",
      "cover the page and say what you remember out loud.",
    ],
  },
  {
    match: /\b(portfolio|website|cv|linkedin|profile|bio|about page)\b/i,
    intro: "nobody sees the first draft.",
    steps: [
      "open it and change one word.",
      "write one sentence about what you actually do.",
      "add the most recent thing you made.",
      "fix the one thing that's been bugging you.",
    ],
  },
  {
    match: /\b(guitar|piano|instrument|song|band|rehears|scales)\b/i,
    intro: "five minutes beats a perfect hour that never happens.",
    steps: [
      "get it out of the case.",
      "play one thing you already know well.",
      "run the hardest bar four times slowly.",
      "tune it. that counts as a session.",
    ],
  },
  {
    match: /\b(garden|plant|water the|repot|weed)\b/i,
    intro: "small and outdoors. good combination.",
    steps: [
      "go and look at them. that's the task.",
      "water the driest one.",
      "pull five weeds and stop.",
      "clear the dead leaves off one plant.",
    ],
  },
  {
    match: /\b(budget|tax|invoice|bill|receipt|expense|refund|bank)\b/i,
    intro: "boring, quick, and off your mind after.",
    steps: [
      "open the app or the folder. don't add anything up yet.",
      "deal with the single oldest item.",
      "write down the one number you're avoiding knowing.",
      "set a reminder for the deadline, then close it.",
    ],
  },
  {
    match: /\b(quit|stop|cut down|habit|streak|vape|smok|drink)\b/i,
    intro: "we're not doing forever. just the next hour.",
    steps: [
      "move the thing out of arm's reach.",
      "write down when you last did it, and when the urge hit.",
      "do the replacement thing once — walk, water, gum.",
      "tell one person you're trying.",
    ],
  },
  {
    match: /\b(read|book|chapter|article|paper|study.*read)\b/i,
    intro: "one page is a real amount of reading.",
    steps: [
      "open it to where you left off.",
      "read one page. stopping after is allowed.",
      "read the first line of the chapter and decide from there.",
      "put it somewhere you'll trip over it tomorrow.",
    ],
  },
  {
    match: /\b(present|presentation|speech|pitch|slides|deck|talk)\b/i,
    intro: "slide one only.",
    steps: [
      "open the deck and title the first slide.",
      "write the one sentence you want people to remember.",
      "list your sections as bullets. no design yet.",
      "say the opening line out loud once.",
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

const FALLBACK_INTRO = "we're not doing the whole thing. just the opener.";

/**
 * Returns the step at `cursor` (wrapping), plus how many distinct steps exist
 * for this thing. Callers decide what counts as progress — browsing the
 * options and working through them are deliberately separate.
 */
export function shrink(
  input: string,
  cursor = 0
): { intro: string; step: string; total: number } {
  const text = input.trim();
  const rule = RULES.find((r) => r.match.test(text));
  const steps = rule ? rule.steps : FALLBACK;
  const intro = rule?.intro ?? FALLBACK_INTRO;
  const i = ((cursor % steps.length) + steps.length) % steps.length;
  return { intro, step: steps[i], total: steps.length };
}
