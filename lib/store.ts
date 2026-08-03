"use client";

// Local-first storage. Every write lands in this browser's localStorage
// first and the app works fully from that — sync (lib/cloud.ts) is a layer
// on top that only runs when NEXT_PUBLIC_SUPABASE_* is configured. With it
// unset, nothing budg3 knows about you is ever transmitted anywhere.

import { useCallback, useEffect, useRef, useState } from "react";
import { Account, currentAccount, dataKeyFor, signOut as clearActive } from "./account";
import { cloudEnabled, deleteCloudState, pullState, pushState } from "./cloud";
import { mergeStates } from "./merge";

export type Receipt = { id: string; text: string; at: number; feeling?: string };

export type Habit = {
  id: string;
  name: string;
  /** ISO dates (YYYY-MM-DD) the habit was done. Only ever appended. */
  days: string[];
};

export type Tracker = {
  id: string;
  name: string;
  unit: string;
  /** date -> count */
  counts: Record<string, number>;
  /** What you decided a full bar means. Unset means budg3 picks one for you —
   *  see targetFor() in lib/daily.ts. Never a line you can fall below. */
  goal?: number;
};

/** The two-tap version of a journal entry. Both fields are optional; a day
 *  with only weather in it is still a day you showed up for. */
export type DayLog = { weather?: string; mood?: string };

/** One small task. "in" = still in the wall, "down" = knocked out,
 *  "aside" = moved out of the way for now, not a failure. */
export type Brick = { id: string; text: string; state: "in" | "down" | "aside" };

/** A wall is one thing you're facing, broken into bricks. */
export type Wall = {
  id: string;
  name: string;
  bricks: Brick[];
  createdAt: number;
  finishedAt?: number;
};

export type Plan = { id: string; text: string; forDay: string; done: boolean };

export type JournalEntry = { id: string; day: string; text: string; at: number };

export type Profile = {
  typeKey?: string;
  age?: string;
  gender?: string;
  /** true once onboarding is done or skipped */
  onboarded: boolean;
  /** true once the how-it-works walkthrough has been seen or skipped */
  tutorialDone?: boolean;
};

export type State = {
  profile: Profile;
  started: number;
  receipts: Receipt[];
  habits: Habit[];
  trackers: Tracker[];
  plans: Plan[];
  journal: JournalEntry[];
  walls: Wall[];
  /** date -> how that day went */
  dayLogs: Record<string, DayLog>;
  /** When this copy was last written. Only used to order two copies of the
   *  same account during a sync merge — see lib/merge.ts. */
  updatedAt?: number;
};

const EMPTY: State = {
  profile: { onboarded: false },
  started: 0,
  receipts: [],
  habits: [],
  trackers: [],
  plans: [],
  journal: [],
  walls: [],
  dayLogs: {},
};

function read(key: string): State {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as State) };
  } catch {
    return EMPTY;
  }
}

function write(key: string, s: State) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ ...s, updatedAt: Date.now() }));
  } catch {
    // storage full or blocked — budg3 still works, it just won't remember.
  }
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** mergeStates takes (older, newer); this puts a pair in that order. */
function order(a: State, b: State): [State, State] {
  return (a.updatedAt ?? 0) <= (b.updatedAt ?? 0) ? [a, b] : [b, a];
}

/** Nothing done yet. Onboarding answers alone don't count as work. */
function isBlank(s: State): boolean {
  return (
    s.started === 0 &&
    s.receipts.length === 0 &&
    s.habits.length === 0 &&
    s.trackers.length === 0 &&
    s.plans.length === 0 &&
    s.journal.length === 0 &&
    s.walls.length === 0 &&
    Object.keys(s.dayLogs).length === 0
  );
}

/**
 * Streaks pause, they never punish. A missed day stops the run — it does not
 * reset it to zero, and nothing ever turns red. We report the current run and
 * the total, and the total is the number that matters.
 */
export function streakOf(days: string[]): { run: number; total: number; paused: boolean } {
  const total = days.length;
  if (total === 0) return { run: 0, total: 0, paused: false };
  const set = new Set(days);
  const d = new Date();
  // A run counts back from today, or from yesterday if today isn't logged yet.
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  let run = 0;
  while (set.has(d.toISOString().slice(0, 10))) {
    run++;
    d.setDate(d.getDate() - 1);
  }
  const paused = run === 0;
  return { run, total, paused };
}

/** What sync is doing, for the one line of interface that reports it. */
export type SyncState = "off" | "idle" | "working" | "error";

export function useStore() {
  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [sync, setSync] = useState<SyncState>(cloudEnabled ? "idle" : "off");

  // Kept in refs because the debounced push fires long after the render that
  // scheduled it, and must not send a stale copy or send to the wrong account.
  const latest = useRef<State>(EMPTY);
  const acctRef = useRef<Account | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Bring this device and the server together.
   *
   * The merge is deliberately not last-write-wins — see lib/merge.ts. A
   * failed read returns null and is left alone: treating "couldn't reach the
   * server" as "the account is empty" would push emptiness over real data.
   */
  const reconcile = useCallback(async (acct: Account | null, local: State): Promise<State> => {
    if (!cloudEnabled || !acct?.id) return local;
    setSync("working");
    const remote = await pullState();
    if (remote === null) {
      setSync("error");
      return local;
    }
    const merged = remote === undefined ? local : mergeStates(...order(remote, local));
    write(dataKeyFor(acct), merged);
    const pushed = await pushState(acct.id, merged);
    setSync(pushed ? "idle" : "error");
    return merged;
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      const acct = await currentAccount();
      const local = read(dataKeyFor(acct));
      if (!live) return;
      setAccount(acct);
      acctRef.current = acct;
      setState(local);
      latest.current = local;
      setReady(true);

      const merged = await reconcile(acct, local);
      if (!live) return;
      setState(merged);
      latest.current = merged;
    })();
    return () => {
      live = false;
    };
  }, [reconcile]);

  /** Coming back to the tab is the moment the other device's work matters. */
  useEffect(() => {
    if (!cloudEnabled) return;
    const onFocus = async () => {
      const acct = acctRef.current;
      if (!acct?.id || document.visibilityState !== "visible") return;
      const merged = await reconcile(acct, latest.current);
      setState(merged);
      latest.current = merged;
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [reconcile]);

  const schedulePush = useCallback((next: State) => {
    if (!cloudEnabled) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    // Batched: knocking out five bricks is one upload, not five.
    pushTimer.current = setTimeout(async () => {
      const acct = acctRef.current;
      if (!acct?.id) return;
      setSync("working");
      setSync((await pushState(acct.id, next)) ? "idle" : "error");
    }, 1500);
  }, []);

  const update = useCallback(
    (fn: (s: State) => State) => {
      setState((prev) => {
        const next = fn(prev);
        write(dataKeyFor(account), next);
        latest.current = next;
        schedulePush(next);
        return next;
      });
    },
    [account, schedulePush]
  );

  /**
   * Switch to an account and load its data.
   *
   * `claimGuest` carries anything done before signing up across to the new
   * account. The link that gets you here says "save my stuff", so losing it
   * at that exact moment would be the worst possible time — and rule one is
   * that there's nothing here you can lose. Only ever on sign-up, only into
   * an account with nothing in it yet, and the guest slot is cleared after so
   * a second new account can't adopt the same work.
   */
  const useAccount = useCallback(
    async (acct: Account | null, opts?: { claimGuest?: boolean }) => {
      let next = read(dataKeyFor(acct));
      if (opts?.claimGuest && acct) {
        const guest = read(dataKeyFor(null));
        if (!isBlank(guest) && isBlank(next)) {
          next = guest;
          write(dataKeyFor(acct), next);
          try {
            window.localStorage.removeItem(dataKeyFor(null));
          } catch {
            // storage blocked — the copy above is what matters
          }
        }
      }
      setAccount(acct);
      acctRef.current = acct;
      setState(next);
      latest.current = next;

      // Signing in on a new device is the whole point: whatever is on the
      // server has to arrive, and whatever is here has to go up.
      const merged = await reconcile(acct, next);
      setState(merged);
      latest.current = merged;
    },
    [reconcile]
  );

  const signOut = useCallback(async () => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    await clearActive();
    const guest = read(dataKeyFor(null));
    setAccount(null);
    acctRef.current = null;
    setState(guest);
    latest.current = guest;
    setSync(cloudEnabled ? "idle" : "off");
  }, []);

  const recordStart = useCallback(
    (text: string, feeling?: string) => {
      update((s) => ({
        ...s,
        started: s.started + 1,
        receipts: [
          { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, at: Date.now(), feeling },
          ...s.receipts,
        ].slice(0, 500),
      }));
    },
    [update]
  );

  /** Remove a start you logged by mistake. The total goes back down too — a
   *  number you can't correct is worse than one that moves. */
  const undoStart = useCallback(
    (id: string) =>
      update((s) => {
        if (!s.receipts.some((r) => r.id === id)) return s;
        return {
          ...s,
          started: Math.max(0, s.started - 1),
          receipts: s.receipts.filter((r) => r.id !== id),
        };
      }),
    [update]
  );

  // ---- walls ----

  const addWall = useCallback(
    (name: string, steps: string[]) =>
      update((s) => ({
        ...s,
        walls: [
          {
            id: `w${Date.now()}`,
            name,
            createdAt: Date.now(),
            bricks: steps.map((text, i) => ({
              id: `b${Date.now()}${i}`,
              text,
              state: "in" as const,
            })),
          },
          ...s.walls,
        ],
      })),
    [update]
  );

  const removeWall = useCallback(
    (wallId: string) => update((s) => ({ ...s, walls: s.walls.filter((w) => w.id !== wallId) })),
    [update]
  );

  const addBrick = useCallback(
    (wallId: string, text: string) =>
      update((s) => ({
        ...s,
        walls: s.walls.map((w) =>
          w.id === wallId
            ? {
                ...w,
                bricks: [
                  ...w.bricks,
                  { id: `b${Date.now()}${Math.random().toString(36).slice(2, 5)}`, text, state: "in" as const },
                ],
              }
            : w
        ),
      })),
    [update]
  );

  const editBrick = useCallback(
    (wallId: string, brickId: string, text: string) =>
      update((s) => ({
        ...s,
        walls: s.walls.map((w) =>
          w.id === wallId
            ? { ...w, bricks: w.bricks.map((b) => (b.id === brickId ? { ...b, text } : b)) }
            : w
        ),
      })),
    [update]
  );

  const removeBrick = useCallback(
    (wallId: string, brickId: string) =>
      update((s) => ({
        ...s,
        walls: s.walls.map((w) =>
          w.id === wallId ? { ...w, bricks: w.bricks.filter((b) => b.id !== brickId) } : w
        ),
      })),
    [update]
  );

  /** Knock a brick out — this is a real start, so it counts everywhere else too. */
  const knockBrick = useCallback(
    (wallId: string, brickId: string) =>
      update((s) => {
        const wall = s.walls.find((w) => w.id === wallId);
        const brick = wall?.bricks.find((b) => b.id === brickId);
        if (!wall || !brick || brick.state === "down") return s;
        const bricks = wall.bricks.map((b) =>
          b.id === brickId ? { ...b, state: "down" as const } : b
        );
        const allDown = bricks.every((b) => b.state !== "in");
        return {
          ...s,
          started: s.started + 1,
          receipts: [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              text: `${wall.name} — ${brick.text}`,
              at: Date.now(),
            },
            ...s.receipts,
          ].slice(0, 500),
          walls: s.walls.map((w) =>
            w.id === wallId
              ? { ...w, bricks, finishedAt: allDown ? Date.now() : w.finishedAt }
              : w
          ),
        };
      }),
    [update]
  );

  /** Move a brick out of the way. Not done, not failed — just not now. */
  const setBrickState = useCallback(
    (wallId: string, brickId: string, state: Brick["state"]) =>
      update((s) => ({
        ...s,
        walls: s.walls.map((w) =>
          w.id === wallId
            ? { ...w, bricks: w.bricks.map((b) => (b.id === brickId ? { ...b, state } : b)) }
            : w
        ),
      })),
    [update]
  );

  const addPlan = useCallback(
    (text: string, forDay: string) =>
      update((s) => ({
        ...s,
        plans: [...s.plans, { id: `p${Date.now()}${Math.random().toString(36).slice(2, 5)}`, text, forDay, done: false }],
      })),
    [update]
  );

  const removePlan = useCallback(
    (id: string) => update((s) => ({ ...s, plans: s.plans.filter((p) => p.id !== id) })),
    [update]
  );

  const completePlan = useCallback(
    (id: string) =>
      update((s) => {
        const plan = s.plans.find((p) => p.id === id);
        if (!plan || plan.done) return s;
        return {
          ...s,
          started: s.started + 1,
          plans: s.plans.map((p) => (p.id === id ? { ...p, done: true } : p)),
          receipts: [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              text: plan.text,
              at: Date.now(),
            },
            ...s.receipts,
          ].slice(0, 500),
        };
      }),
    [update]
  );

  const addJournal = useCallback(
    (text: string) =>
      update((s) => ({
        ...s,
        journal: [
          { id: `j${Date.now()}`, day: today(), text, at: Date.now() },
          ...s.journal,
        ].slice(0, 1000),
      })),
    [update]
  );

  const removeJournal = useCallback(
    (id: string) => update((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== id) })),
    [update]
  );

  const renameHabit = useCallback(
    (id: string, name: string) =>
      update((s) => ({ ...s, habits: s.habits.map((h) => (h.id === id ? { ...h, name } : h)) })),
    [update]
  );

  const setProfile = useCallback(
    (p: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    [update]
  );

  const addHabit = useCallback(
    (name: string) =>
      update((s) => ({
        ...s,
        habits: [...s.habits, { id: `h${Date.now()}`, name, days: [] }],
      })),
    [update]
  );

  const toggleHabitToday = useCallback(
    (id: string) =>
      update((s) => ({
        ...s,
        habits: s.habits.map((h) => {
          if (h.id !== id) return h;
          const t = today();
          return h.days.includes(t)
            ? { ...h, days: h.days.filter((d) => d !== t) }
            : { ...h, days: [...h.days, t] };
        }),
      })),
    [update]
  );

  const removeHabit = useCallback(
    (id: string) => update((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) })),
    [update]
  );

  const addTracker = useCallback(
    (name: string, unit: string) =>
      update((s) => ({
        ...s,
        trackers: [...s.trackers, { id: `t${Date.now()}`, name, unit, counts: {} }],
      })),
    [update]
  );

  const bumpTracker = useCallback(
    (id: string, by: number) =>
      update((s) => ({
        ...s,
        trackers: s.trackers.map((t) => {
          if (t.id !== id) return t;
          const d = today();
          const next = Math.max(0, (t.counts[d] ?? 0) + by);
          return { ...t, counts: { ...t.counts, [d]: next } };
        }),
      })),
    [update]
  );

  /** Set today's count outright, for when tapping + eleven times is absurd. */
  const setTrackerToday = useCallback(
    (id: string, n: number) =>
      update((s) => ({
        ...s,
        trackers: s.trackers.map((t) =>
          t.id === id ? { ...t, counts: { ...t.counts, [today()]: Math.max(0, Math.round(n)) } } : t
        ),
      })),
    [update]
  );

  /** Claim the target as yours, or hand it back to budg3 by passing null. */
  const setTrackerGoal = useCallback(
    (id: string, goal: number | null) =>
      update((s) => ({
        ...s,
        trackers: s.trackers.map((t) => {
          if (t.id !== id) return t;
          if (goal === null || !(goal > 0)) {
            const { goal: _dropped, ...rest } = t;
            return rest;
          }
          return { ...t, goal: Math.round(goal) };
        }),
      })),
    [update]
  );

  const removeTracker = useCallback(
    (id: string) => update((s) => ({ ...s, trackers: s.trackers.filter((t) => t.id !== id) })),
    [update]
  );

  /** Tapping the chip you already picked clears it — nothing here is a
   *  question you're forced to answer. */
  const setDayLog = useCallback(
    (field: keyof DayLog, value: string | null) =>
      update((s) => {
        const d = today();
        const prev = s.dayLogs[d] ?? {};
        const next = { ...prev, [field]: value ?? undefined };
        return { ...s, dayLogs: { ...s.dayLogs, [d]: next } };
      }),
    [update]
  );

  const exportAll = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budg3-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  /** Erase means erase. If there's a server copy, that goes too — otherwise
   *  the next sync would hand it all straight back. */
  const wipe = useCallback(async () => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    try {
      window.localStorage.removeItem(dataKeyFor(account));
    } catch {
      // nothing to clear
    }
    setState(EMPTY);
    latest.current = EMPTY;
    if (cloudEnabled && account?.id) {
      setSync("working");
      setSync((await deleteCloudState(account.id)) ? "idle" : "error");
    }
  }, [account]);

  return {
    state,
    ready,
    account,
    sync,
    useAccount,
    signOut,
    recordStart,
    undoStart,
    addWall,
    removeWall,
    addBrick,
    editBrick,
    removeBrick,
    knockBrick,
    setBrickState,
    addPlan,
    removePlan,
    completePlan,
    addJournal,
    removeJournal,
    renameHabit,
    setProfile,
    addHabit,
    toggleHabitToday,
    removeHabit,
    addTracker,
    bumpTracker,
    setTrackerToday,
    setTrackerGoal,
    removeTracker,
    setDayLog,
    exportAll,
    wipe,
  };
}
