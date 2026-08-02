# budg3

**brick by brick.**

> don't run at the wall. take it down brick by brick.

The thing you're avoiding is a wall, and running at it has never worked. budg3
hands you one brick at a time — small enough to actually pull loose — whether
the wall is an essay, the gym, a message you owe, or just getting off the
chair. Sign up with an email to keep your bricks counted.

See [CONCEPT.md](./CONCEPT.md) for the full product thinking.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

## Deploy to Vercel

The app is a static-friendly Next.js App Router project with **no backend, no
env vars, and no database** — so deployment is zero-config.

**From the dashboard:** import the repo at
[vercel.com/new](https://vercel.com/new). Vercel detects Next.js and needs no
further setup.

**From the CLI:**

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production deploy
```

## How it's built

| path | what's in it |
|---|---|
| `app/page.tsx` | Shell, auth gate, tab routing, wind-down mode |
| `lib/account.ts` | **Accounts — the one file to change for real cross-device sync** |
| `lib/areas.ts` | Life areas (school, body, creative, people…) with starts and habit ideas |
| `lib/feelings.ts` | The feeling menu (numb → joyful) and the step pools it routes to |
| `lib/shrinker.ts` | Turns a dreaded thing into one small first move |
| `lib/quiz.ts` | First-run starting-type quiz |
| `lib/daily.ts` | The day log: weather, how it went, and how long a bar is |
| `lib/store.ts` | localStorage state: receipts, habits, trackers, plans, journal, gentle streaks |
| `lib/history.ts` | Week grids, tracker series, milestones — reading back what's stored |
| `lib/quiz.ts` | Starting types: which door opens first, which step pools are favoured |
| `components/` | The three front doors, start-with-me, keep-going, receipts, garden |

### The rules the code has to keep

These aren't style preferences — they're the product:

1. **Nothing you can lose.** Counters only rise. Streaks *pause* on a miss and
   never reset to zero (`streakOf` in `lib/store.ts`). Nothing turns red.
2. **Skipping is free.** Every step has a no-cost way out that deals a gentler one.
3. **The reward is immediate.** `celebrate()` fires on the same tick as the tap —
   that immediacy is what wires the habit.
4. **Your data stays yours.** No analytics, no tracking, no selling anything.
   Export and erase are one tap each.
5. **No dark patterns.** No guilt notifications, no loss aversion, no streaks
   that punish, no infinite scroll.
6. **Nothing shows failure.** A missed day in a week grid is an unfilled box,
   never a red one. Milestones mark totals, so they can only be reached, never
   broken.
7. **A target is a length, not a line.** Day bars have a target so the bar has
   an end, but it is never something you fall below: no red, no overdue, no
   "you missed it", and a day over the target is drawn the same as a day under.
   Going past it reads as going past it (`+3 past it`), in the same colour as
   a win.

## Optional: better bricks with Groq

Out of the box, walls are built from the rules in `lib/shrinker.ts`. Those
cover a lot, but there's always a long tail where you get the generic steps.

Set a `GROQ_API_KEY` and walls get broken down by a model instead, falling
back to the rules on any failure — no key, timeout, bad response, offline.
The rules stay the floor, so the app never needs the network to work.

```bash
cp .env.example .env.local     # then paste your key in
npm run dev
```

On Vercel: **Settings → Environment Variables → GROQ_API_KEY**, then redeploy.
Get a key at [console.groq.com/keys](https://console.groq.com/keys).

### Checking it actually works

Because every failure falls back to the rules, a broken key looks exactly like
a working one from the outside. So the route reports on itself — open
`/api/bricks` in a browser:

```json
{ "ready": true, "model": "llama-3.3-70b-versatile", "detail": "ready. walls are broken down by the model." }
```

`ready: false` comes with a `detail` saying which of the three things went
wrong — no key set, key rejected, or the model retired. In that last case the
response lists every model the account can use; pick one and set `GROQ_MODEL`.
The key itself is never returned, in whole or in part.

You can also tell from the app: build a wall for something obscure (say
*get into beekeeping*). The model path says **"written for this one
specifically"** above the bricks; the rules path doesn't.

**What this changes about privacy.** The key lives only on the server — it is
never `NEXT_PUBLIC_`, so it never reaches the browser. But with it enabled,
**the name of a wall is sent to Groq**. Nothing else ever is: habits, trackers,
journal entries and history stay on the device. With no key set, nothing leaves
the device at all.

Two guards worth knowing about:
- Input matching crisis language is refused before any model call, whether or
  not a key is configured, and the app points to real support instead. A task
  list is the wrong answer to that.
- Model output must parse to at least three usable steps or it's discarded and
  the rules are used.

## Accounts, and what "signed in" means today

Sign-up is real — an email creates an account and all data (habits, streaks,
trackers, receipts) is stored under it, so two accounts on the same browser
never see each other's stuff. **But right now that storage is `localStorage`,
so an account is device-local**: signing in on a phone won't show what you did
on a laptop.

That's deliberate — it keeps the app deployable with zero configuration and
keeps personal data off a server until there's a considered place to put it.

To make accounts sync across devices, replace the four functions in
`lib/account.ts` (`signUp`, `signIn`, `signOut`, `currentAccount`) with an auth
provider and a database, and persist `State` server-side instead of in
`localStorage`. Nothing else in the app needs to change — everything reads
accounts through that one interface. Practical options: Supabase (email auth +
Postgres in one), or Auth.js with Vercel Postgres and Resend for magic links.

Before storing this data on a server, be aware it may include minors' personal
information — worth deciding on retention, deletion, and a privacy policy first.

## Not medical software

budg3 is a supportive tool for starting. It doesn't diagnose, treat, or replace
real care, and it makes no medical claims. A calm route to real human support is
always reachable from the footer.
