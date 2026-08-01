"use client";

// Local-first storage. Everything budg3 knows about you lives in this
// browser and is never transmitted anywhere. No account, nothing to leak.

import { useCallback, useEffect, useState } from "react";
import { Account, currentAccount, dataKeyFor, signOut as clearActive } from "./account";

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
};

export type Plan = { id: string; text: string; forDay: string; done: boolean };

export type JournalEntry = { id: string; day: string; text: string; at: number };

export type Profile = {
  typeKey?: string;
  age?: string;
  gender?: string;
  /** true once onboarding is done or skipped */
  onboarded: boolean;
};

export type State = {
  profile: Profile;
  started: number;
  receipts: Receipt[];
  habits: Habit[];
  trackers: Tracker[];
  plans: Plan[];
  journal: JournalEntry[];
};

const EMPTY: State = {
  profile: { onboarded: false },
  started: 0,
  receipts: [],
  habits: [],
  trackers: [],
  plans: [],
  journal: [],
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
    window.localStorage.setItem(key, JSON.stringify(s));
  } catch {
    // storage full or blocked — budg3 still works, it just won't remember.
  }
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
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

export function useStore() {
  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const acct = currentAccount();
    setAccount(acct);
    setState(read(dataKeyFor(acct)));
    setReady(true);
  }, []);

  const update = useCallback(
    (fn: (s: State) => State) => {
      setState((prev) => {
        const next = fn(prev);
        write(dataKeyFor(account), next);
        return next;
      });
    },
    [account]
  );

  /** Switch to an account and load its data. */
  const useAccount = useCallback((acct: Account | null) => {
    setAccount(acct);
    setState(read(dataKeyFor(acct)));
  }, []);

  const signOut = useCallback(() => {
    clearActive();
    setAccount(null);
    setState(read(dataKeyFor(null)));
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

  const removeTracker = useCallback(
    (id: string) => update((s) => ({ ...s, trackers: s.trackers.filter((t) => t.id !== id) })),
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

  const wipe = useCallback(() => {
    try {
      window.localStorage.removeItem(dataKeyFor(account));
    } catch {
      // nothing to clear
    }
    setState(EMPTY);
  }, [account]);

  return {
    state,
    ready,
    account,
    useAccount,
    signOut,
    recordStart,
    undoStart,
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
    removeTracker,
    exportAll,
    wipe,
  };
}
