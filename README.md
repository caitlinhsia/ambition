# budge

**learn to start.**

> turns out most of "being unmotivated" is just *not having started yet.*

A local-first web app for teens who can't get going. One tiny first step at a
time. No login, no accounts, no analytics — everything lives in the browser and
never leaves the device.

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
| `app/page.tsx` | Shell, tab routing, wind-down mode |
| `lib/feelings.ts` | The feeling menu (numb → joyful) and the step pools it routes to |
| `lib/shrinker.ts` | Turns a dreaded thing into one small first move |
| `lib/quiz.ts` | First-run starting-type quiz |
| `lib/store.ts` | localStorage state: receipts, habits, trackers, gentle streaks |
| `components/` | The three front doors, start-with-me, keep-going, receipts, garden |

### The rules the code has to keep

These aren't style preferences — they're the product:

1. **Nothing you can lose.** Counters only rise. Streaks *pause* on a miss and
   never reset to zero (`streakOf` in `lib/store.ts`). Nothing turns red.
2. **Skipping is free.** Every step has a no-cost way out that deals a gentler one.
3. **The reward is immediate.** `celebrate()` fires on the same tick as the tap —
   that immediacy is what wires the habit.
4. **Nothing leaves the device.** No network calls, no analytics, no accounts.
   Export and erase are one tap each.
5. **No dark patterns.** No guilt notifications, no loss aversion, no streaks
   that punish, no infinite scroll.

## Not medical software

budge is a supportive tool for starting. It doesn't diagnose, treat, or replace
real care, and it makes no medical claims. A calm route to real human support is
always reachable from the footer.
