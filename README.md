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
   never a red one. Trackers have no target lines. Milestones mark totals, so
   they can only be reached, never broken.

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
