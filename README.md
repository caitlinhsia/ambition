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
| `lib/account.ts` | Sign up / sign in — local by default, code-based when synced |
| `lib/cloud.ts` | The optional Supabase client. Inert with no env vars set |
| `lib/merge.ts` | Combines two devices' data with nothing lost — see below |
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

## Accounts, and whether they sync

Sign-up is real either way — an email creates an account and all data
(habits, streaks, trackers, receipts) is stored under it, so two accounts
never see each other's stuff. What differs is where "stored" means:

**Out of the box: local.** Data lives in this browser's `localStorage`. An
account is device-local — signing in on a phone won't show what you did on a
laptop, and there's no password, because there's nothing to protect it from
that isn't already the device itself. Nothing ever leaves it. This is
deliberate: it keeps the app deployable with zero configuration and keeps
personal data off a server until there's a considered place to put it.

**Set two env vars: synced.** Add `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`) and the same account
opens on any device. Sign-in becomes a six-digit code emailed to you instead
of a bare email field — with data now on a server, proving you can read the
inbox is what stops anyone typing your email and reading your journal.

### Setting sync up

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste in `supabase/schema.sql` → **Run**.
   This creates one table (`states`) and locks it down with row-level
   security, so the public anon key can only ever read or write the row
   belonging to whoever is signed in — never anyone else's.
3. **Authentication → Providers → Email**: turn **on** "Enable email OTP" /
   magic link (naming varies by Supabase version) and turn **off** "Confirm
   email" if present, since the code itself is the confirmation.
4. **Settings → API**: copy the Project URL and the `anon` `public` key
   (never the `service_role` key — that one bypasses row-level security
   entirely and must never reach a browser) into `.env.local` or Vercel's
   environment variables, then redeploy.

### How two devices editing offline reconcile

Sync isn't last-write-wins — a stale phone overwriting an evening's laptop
work would break rule one, *nothing you can lose*. Instead `lib/merge.ts`
combines both sides: receipts, habits, journal entries and walls are unioned;
counters and tracker counts take the higher value; a brick that's been
knocked out of the wall on either device stays knocked out. The trade-off is
that deleting something on one device doesn't delete it on the other until
that device syncs too — union can't tell "never happened" from "happened
somewhere I haven't heard from yet" apart, and losing a habit is worse than
briefly still seeing one you meant to remove. `lib/merge.test.ts` has the
whole contract as running tests, including that merging is order-independent
and that repeated merges settle instead of drifting.

Sync happens on sign-in, when the tab regains focus, and a few seconds after
you make a change (batched, so knocking out five bricks is one upload). A
small `syncing…` / `saved here only` note appears near the top only when
there's something worth saying — it's never an alarm, since everything is
always saved to the device first regardless of whether the network is there.

Before turning this on for real users, be aware this data may include
minors' personal information — worth deciding on retention, deletion, and a
privacy policy first. "Erase everything" (**you → your record**) already
deletes the server row along with the local copy.

## Not medical software

budg3 is a supportive tool for starting. It doesn't diagnose, treat, or replace
real care, and it makes no medical claims. A calm route to real human support is
always reachable from the footer.
